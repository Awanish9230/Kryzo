const asyncHandler = require('express-async-handler');
const Question = require('../models/Question');
const Test = require('../models/Test');
const UserAttempt = require('../models/UserAttempt');
const Documentation = require('../models/Documentation');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const ReportedQuestion = require('../models/ReportedQuestion');

// @desc    Generate Diagnostic Test
// @route   GET /api/student/test/diagnostic
// @access  Private/Student
const generateDiagnosticTest = asyncHandler(async (req, res) => {
    const mongoose = require('mongoose');
    const selectedQuestionIds = new Set();
    let selectedQuestions = [];

    // Helper to pick random questions
    const pickQuestions = async (type, difficulty, count) => {
        const questions = await Question.aggregate([
            {
                $match: {
                    status: 'published',
                    type: type,
                    difficulty: difficulty,
                    _id: { $nin: Array.from(selectedQuestionIds).map(id => new mongoose.Types.ObjectId(id)) }
                }
            },
            { $sample: { size: count } }
        ]);

        questions.forEach(q => {
            selectedQuestions.push(q);
            selectedQuestionIds.add(q._id.toString());
        });

        return questions.length;
    };

    // 1. Pick MCQs: 10 Easy, 5 Medium, 5 Hard (Total 20)
    await pickQuestions('MCQ', 'easy', 10);
    await pickQuestions('MCQ', 'medium', 5);
    await pickQuestions('MCQ', 'hard', 5);

    // 2. Pick Coding: 2 Easy, 1 Medium, 1 Hard (Total 4)
    await pickQuestions('CODING', 'easy', 2);
    await pickQuestions('CODING', 'medium', 1);
    await pickQuestions('CODING', 'hard', 1);

    // 3. Fallback: If total is less than 24, fill with random published questions to reach the target
    if (selectedQuestions.length < 24) {
        const needed = 24 - selectedQuestions.length;
        const extraQuestions = await Question.aggregate([
            {
                $match: {
                    status: 'published',
                    _id: { $nin: Array.from(selectedQuestionIds).map(id => new mongoose.Types.ObjectId(id)) }
                }
            },
            { $sample: { size: needed } }
        ]);

        extraQuestions.forEach(q => {
            selectedQuestions.push(q);
            selectedQuestionIds.add(q._id.toString());
        });
    }

    // 4. Create Test Record (Duration updated to 90 mins for 24 questions)
    const test = await Test.create({
        type: 'DIAGNOSTIC',
        duration: 90, // Increased to 90 mins to allow time for 4 coding problems
        questions: selectedQuestions.map(q => q._id),
        createdBy: req.user.id
    });

    const populatedTest = await Test.findById(test._id)
        .populate('questions', '-options.isCorrect -testCases.output -testCases.isHidden');

    res.status(201).json(populatedTest);
});

// @desc    Submit Test Attempt
// @route   POST /api/student/test/submit
// @access  Private/Student
const submitTest = asyncHandler(async (req, res) => {
    const { testId, answers } = req.body;
    // answers: [{ questionId, userAnswer, timeTaken, selectedOption, code }]

    const test = await Test.findById(testId).populate('questions');
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    const gradedAnswers = [];
    let score = 0;
    let maxPossibleScore = 0;
    const axios = require('axios');

    // Calculate maxPossibleScore based on all questions in the test
    test.questions.forEach(q => {
        if (q.type === 'MCQ') {
            if (q.difficulty === 'easy') maxPossibleScore += 1;
            else if (q.difficulty === 'medium') maxPossibleScore += 2;
            else if (q.difficulty === 'hard') maxPossibleScore += 3;
        } else if (q.type === 'CODING') {
            if (q.difficulty === 'easy') maxPossibleScore += 5;
            else if (q.difficulty === 'medium') maxPossibleScore += 10;
            else if (q.difficulty === 'hard') maxPossibleScore += 15;
        }
    });

    for (const ans of answers) {
        const question = test.questions.find(q => q._id.toString() === ans.questionId);
        let isCorrect = false;
        let executionResults = [];
        let questionScore = 0;
        let questionMaxScore = 0;

        if (question) {
            // Determine marks based on difficulty
            let marks = 0;
            if (question.type === 'MCQ') {
                if (question.difficulty === 'easy') marks = 1;
                else if (question.difficulty === 'medium') marks = 2;
                else if (question.difficulty === 'hard') marks = 3;
            } else if (question.type === 'CODING') {
                if (question.difficulty === 'easy') marks = 5;
                else if (question.difficulty === 'medium') marks = 10;
                else if (question.difficulty === 'hard') marks = 15;
            }

            questionMaxScore = marks;

            if (question.type === 'MCQ') {
                const correctIdx = question.options.findIndex(opt => opt.isCorrect);
                if (correctIdx !== -1 && ans.selectedOption !== undefined && ans.selectedOption !== null && Number(ans.selectedOption) === correctIdx) {
                    isCorrect = true;
                    questionScore = marks;
                    score += questionScore;
                }
            } else if (question.type === 'CODING') {
                if (ans.code && question.testCases && question.testCases.length > 0) {
                    let passedCount = 0;
                    for (const tc of question.testCases) {
                        try {
                            const response = await axios.post('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
                                source_code: ans.code,
                                language_id: ans.languageId || 63,
                                stdin: tc.input || '',
                                expected_output: tc.output || ''
                            }, {
                                headers: {
                                    'x-rapidapi-key': process.env.JUDGE0_KEY || 'free_tier_key',
                                    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                                    'Content-Type': 'application/json'
                                }
                            });

                            const result = response.data;
                            const isPassing = (result.status && result.status.id === 3);
                            if (isPassing) passedCount++;

                            executionResults.push({
                                input: tc.input,
                                expected: tc.output,
                                actual: result.stdout,
                                status: result.status?.description || 'Unknown',
                                passed: isPassing
                            });
                        } catch (err) {
                            console.error('Judge0 Error:', err.message);
                            executionResults.push({ status: 'Platform Error', passed: false });
                        }
                    }

                    if (passedCount === question.testCases.length) {
                        isCorrect = true;
                        questionScore = marks;
                        score += questionScore;
                    }
                }
            }
        }

        gradedAnswers.push({
            questionId: ans.questionId,
            userAnswer: ans.userAnswer || ans.code || ans.selectedOption,
            isCorrect,
            score: questionScore,
            maxScore: questionMaxScore,
            timeTaken: ans.timeTaken,
            executionResults
        });
    }

    // Update Activity Logic
    const todayStr = new Date().toISOString().split('T')[0];
    let dailyActivity = await UserActivity.findOne({ userId: req.user.id, date: todayStr });
    if (!dailyActivity) dailyActivity = new UserActivity({ userId: req.user.id, date: todayStr });

    const solvedCount = gradedAnswers.filter(a => a.isCorrect).length;
    dailyActivity.questionsSolved += solvedCount;

    if (!dailyActivity.isCompleted && (dailyActivity.timeSpent >= 1800 || dailyActivity.questionsSolved >= 2)) {
        dailyActivity.isCompleted = true;

        // Update User Streak
        const userObj = await User.findById(req.user.id);
        if (userObj.lastActivityDate !== todayStr) {
            const yest = new Date();
            yest.setDate(yest.getDate() - 1);
            const yestStr = yest.toISOString().split('T')[0];

            if (userObj.lastActivityDate === yestStr) {
                userObj.currentStreak += 1;
            } else {
                userObj.currentStreak = 1;
            }

            if (userObj.currentStreak > userObj.longestStreak) userObj.longestStreak = userObj.currentStreak;
            userObj.lastActivityDate = todayStr;
            await userObj.save();
        }
    }
    await dailyActivity.save();

    const attempt = await UserAttempt.create({
        userId: req.user.id,
        testId,
        answers: gradedAnswers,
        score,
        totalTime: answers.reduce((acc, curr) => acc + (curr.timeTaken || 0), 0),
        completedAt: Date.now()
    });

    res.status(201).json(attempt);
});

// @desc    Get Improvement Plan
// @route   GET /api/student/plan
// @access  Private/Student
const getImprovementPlan = asyncHandler(async (req, res) => {
    const mongoose = require('mongoose');

    // Get last attempt
    const lastAttempt = await UserAttempt.findOne({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .populate({
            path: 'answers.questionId',
            select: 'topics topic difficulty type title'
        })
        .populate({
            path: 'testId',
            populate: {
                path: 'questions',
                select: 'topic topics difficulty type'
            }
        });

    if (!lastAttempt) {
        res.status(404);
        throw new Error('No attempts found');
    }

    // 1. Identify Unattempted Questions
    const attemptedQuestionIds = new Set(lastAttempt.answers.map(ans => ans.questionId?._id?.toString()));
    const unattemptedQuestions = lastAttempt.testId?.questions.filter(q => !attemptedQuestionIds.has(q._id.toString())) || [];

    // 2. Analyze Performance with Weakness Score
    const topicStats = {}; // { 'Arrays': { correct: 2, total: 3, unattempted: 1, weaknessScore: 0.5 } }
    let totalCorrect = 0;

    // Process attempted answers
    lastAttempt.answers.forEach(ans => {
        const question = ans.questionId;
        if (question) {
            if (ans.isCorrect) totalCorrect++;

            // Use 'topic' or first element of 'topics'
            const t = question.topic || (question.topics && question.topics[0]);
            if (t) {
                if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0, unattempted: 0, incorrect: 0 };
                topicStats[t].total += 1;
                if (ans.isCorrect) {
                    topicStats[t].correct += 1;
                } else {
                    topicStats[t].incorrect += 1;
                }
            }
        }
    });

    // Process unattempted questions (mark as weak areas)
    unattemptedQuestions.forEach(q => {
        const t = q.topic || (q.topics && q.topics[0]);
        if (t) {
            if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0, unattempted: 0, incorrect: 0 };
            topicStats[t].total += 1;
            topicStats[t].unattempted += 1;
        }
    });

    // Calculate weakness score for each topic
    for (const [topic, stats] of Object.entries(topicStats)) {
        // Weakness score = (incorrect + unattempted) / total
        stats.weaknessScore = stats.total > 0 ? (stats.incorrect + stats.unattempted) / stats.total : 0;
        stats.accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    }

    // 3. Select Top 2 Weakest Topics for Weekly Focus
    const sortedByWeakness = Object.entries(topicStats)
        .sort((a, b) => b[1].weaknessScore - a[1].weaknessScore);

    // Focus on top 2 weakest topics (or 1 if only 1 exists)
    const focusTopics = sortedByWeakness.slice(0, 2).map(([topic]) => topic);

    // Fallback if no topics found
    if (focusTopics.length === 0) {
        focusTopics.push("General Aptitude", "Programming Basics");
    }

    // 4. Identify Weak & Strong Areas for display
    const weakTopics = [];
    const strongTopics = [];

    for (const [topic, stats] of Object.entries(topicStats)) {
        if (stats.unattempted > 0 || stats.accuracy < 60) {
            weakTopics.push(topic);
        } else if (stats.accuracy >= 80) {
            strongTopics.push(topic);
        }
    }

    // 5. Generate Motivation
    let maxPossibleScore = 0;
    if (lastAttempt.testId && lastAttempt.testId.questions) {
        lastAttempt.testId.questions.forEach(q => {
            if (q.type === 'MCQ') {
                if (q.difficulty === 'easy') maxPossibleScore += 1;
                else if (q.difficulty === 'medium') maxPossibleScore += 2;
                else if (q.difficulty === 'hard') maxPossibleScore += 3;
            } else if (q.type === 'CODING') {
                if (q.difficulty === 'easy') maxPossibleScore += 5;
                else if (q.difficulty === 'medium') maxPossibleScore += 10;
                else if (q.difficulty === 'hard') maxPossibleScore += 15;
            }
        });
    } else {
        maxPossibleScore = lastAttempt.answers.reduce((acc, curr) => acc + (curr.maxScore || 0), 0);
    }

    const percentage = maxPossibleScore > 0 ? (lastAttempt.score / maxPossibleScore) * 100 : 0;
    const totalQuestionsCount = (lastAttempt.testId?.questions?.length) || lastAttempt.answers.length;

    let motivation = '';
    if (percentage < 40) {
        motivation = "Don't be discouraged! Every expert was once a beginner. Focus on the basics and complete your daily tasks.";
    } else if (percentage < 70) {
        motivation = "Good progress! You're getting there. Consistency will help you bridge the gap in your weak areas.";
    } else {
        motivation = "Excellent performance! Keep challenging yourself with complex problems to stay on top.";
    }

    // 6. Build 7-Day Plan with Automatic Question Assignment
    const dailyTasks = [];
    const today = new Date();

    // Topic distribution: Days 1-3 focus on Topic 1, Days 4-6 on Topic 2, Day 7 review both
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() + i + 1);
        const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });

        // Determine topic for this day
        let topic;
        if (i < 3) {
            topic = focusTopics[0]; // Days 1-3: First weak topic
        } else if (i < 6) {
            topic = focusTopics[1] || focusTopics[0]; // Days 4-6: Second weak topic (or first if only 1)
        } else {
            topic = focusTopics[0]; // Day 7: Review first topic
        }

        // Fetch documentation for this topic
        const doc = await Documentation.findOne({
            $or: [
                { topic: new RegExp(`^${topic}$`, 'i') },
                { title: new RegExp(topic, 'i') }
            ]
        });

        // Fetch MCQ questions for this topic
        const topicRegex = new RegExp(`^${topic.trim()}$`, 'i');
        const mcqQuestions = await Question.aggregate([
            {
                $match: {
                    status: 'published',
                    type: 'MCQ',
                    $or: [
                        { topic: topicRegex },
                        { topics: topicRegex }
                    ]
                }
            },
            { $sample: { size: 4 } } // Try to get 4 MCQs
        ]);

        // Fetch coding questions for this topic
        const codingQuestions = await Question.aggregate([
            {
                $match: {
                    status: 'published',
                    type: 'CODING',
                    $or: [
                        { topic: topicRegex },
                        { topics: topicRegex }
                    ]
                }
            },
            { $sample: { size: 1 } } // Get 1 coding question
        ]);

        // Build tasks with actual question counts
        const tasks = [
            {
                type: 'READ',
                description: `Study ${topic} documentation and core concepts.`,
                resource: doc ? { title: doc.title, id: doc._id } : null
            }
        ];

        // Add MCQ task if questions available
        if (mcqQuestions.length > 0) {
            tasks.push({
                type: 'PRACTICE_MCQ',
                description: `Solve ${mcqQuestions.length} MCQ question${mcqQuestions.length > 1 ? 's' : ''} on ${topic}.`,
                target: `${mcqQuestions.length} MCQ${mcqQuestions.length > 1 ? 's' : ''}`,
                questionIds: mcqQuestions.map(q => q._id),
                availableCount: mcqQuestions.length
            });
        } else {
            tasks.push({
                type: 'PRACTICE_MCQ',
                description: `No MCQ questions available for ${topic} yet.`,
                target: "0 MCQs",
                questionIds: [],
                availableCount: 0
            });
        }

        // Add coding task if questions available
        if (codingQuestions.length > 0) {
            tasks.push({
                type: 'PRACTICE_CODING',
                description: `Complete ${codingQuestions.length} coding challenge on ${topic}.`,
                target: `${codingQuestions.length} Coding`,
                questionIds: codingQuestions.map(q => q._id),
                availableCount: codingQuestions.length
            });
        } else {
            tasks.push({
                type: 'PRACTICE_CODING',
                description: `No coding questions available for ${topic} yet.`,
                target: "0 Coding",
                questionIds: [],
                availableCount: 0
            });
        }

        dailyTasks.push({
            day: `Day ${i + 1}`,
            dayNumber: i + 1,
            date: dayDate.toISOString().split('T')[0],
            dayName: dayName,
            topic: topic,
            tasks: tasks,
            assignedQuestions: [...mcqQuestions.map(q => q._id), ...codingQuestions.map(q => q._id)],
            link: `/student/test/daily/${i + 1}`
        });
    }

    res.json({
        attemptId: lastAttempt._id,
        score: lastAttempt.score,
        percentage: Math.round(percentage),
        totalQuestions: totalQuestionsCount,
        correctQuestions: totalCorrect,
        motivation,
        focusTopics: focusTopics, // NEW: Show which 2 topics we're focusing on
        analysis: {
            weak: weakTopics,
            strong: strongTopics
        },
        plan: dailyTasks,
        questions: lastAttempt.answers.map(ans => {
            let status = 'skipped';
            if (ans.isCorrect) status = 'solved';
            else if (ans.userAnswer !== undefined && ans.userAnswer !== null && ans.userAnswer !== '') status = 'attempted';

            return {
                _id: ans.questionId?._id || Math.random().toString(),
                title: ans.questionId?.title || 'Question',
                type: ans.questionId?.type || 'MCQ',
                difficulty: ans.questionId?.difficulty || 'medium',
                status: status,
                score: ans.score,
                maxScore: ans.maxScore,
                timeTaken: ans.timeTaken
            };
        })
    });
});


// @desc    Create Custom Test
// @route   POST /api/student/test/custom
// @access  Private/Student
const createCustomTest = asyncHandler(async (req, res) => {
    const { topics, difficulty, numQuestions = 10, type = 'mixed' } = req.body;
    const questionCount = Number(numQuestions);

    // Phase 1: Try exact match (Topics + Difficulty + Type)
    const exactMatch = { status: 'published' };

    if (topics && topics.length > 0) {
        // Build regex for each topic for case-insensitivity
        const topicRegexes = topics.map(t => new RegExp(`^${t.trim()}$`, 'i'));
        exactMatch.$or = [
            { topic: { $in: topicRegexes } },
            { topics: { $in: topicRegexes } }
        ];
    }

    if (difficulty) exactMatch.difficulty = difficulty;

    if (type === 'mcq') exactMatch.type = 'MCQ';
    else if (type === 'coding') exactMatch.type = 'CODING';

    let questions = await Question.aggregate([
        { $match: exactMatch },
        { $sample: { size: questionCount } }
    ]);

    // Phase 2: Fallback 1 - Try matching Topics + Type (ignore difficulty)
    if (questions.length < questionCount && topics && topics.length > 0) {
        const existingIds = questions.map(q => q._id);
        const needed = questionCount - questions.length;
        const topicRegexes = topics.map(t => new RegExp(`^${t.trim()}$`, 'i'));

        const fallbackMatch = {
            status: 'published',
            _id: { $nin: existingIds },
            $or: [
                { topic: { $in: topicRegexes } },
                { topics: { $in: topicRegexes } }
            ]
        };
        if (type === 'mcq') fallbackMatch.type = 'MCQ';
        else if (type === 'coding') fallbackMatch.type = 'CODING';

        const fallbackQuestions = await Question.aggregate([
            { $match: fallbackMatch },
            { $sample: { size: Number(needed) } }
        ]);

        questions = [...questions, ...fallbackQuestions];
    }

    // Phase 3: Fallback 2 - Broadest match (ignore difficulty AND type)
    if (questions.length < questionCount && topics && topics.length > 0) {
        const existingIds = questions.map(q => q._id);
        const needed = questionCount - questions.length;
        const topicRegexes = topics.map(t => new RegExp(`^${t.trim()}$`, 'i'));

        const broadMatch = {
            status: 'published',
            _id: { $nin: existingIds },
            $or: [
                { topic: { $in: topicRegexes } },
                { topics: { $in: topicRegexes } }
            ]
        };

        const broadQuestions = await Question.aggregate([
            { $match: broadMatch },
            { $sample: { size: Number(needed) } }
        ]);

        questions = [...questions, ...broadQuestions];
    }

    if (questions.length === 0) {
        res.status(404);
        throw new Error(`Insufficient questions found for: ${topics.join(', ')} (${type}, ${difficulty}). Please try with different settings or add more questions.`);
    }

    // Dynamic Duration Calculation
    let totalDuration = 0;
    questions.forEach(q => {
        if (q.type === 'MCQ') {
            totalDuration += 2; // 2 minutes per MCQ
        } else if (q.type === 'CODING') {
            totalDuration += (q.expectedTime || 15); // Use defined time or default 15 mins
        }
    });

    if (totalDuration === 0) totalDuration = questions.length * 5;

    const test = await Test.create({
        type: 'CUSTOM',
        duration: totalDuration,
        questions: questions.map(q => q._id),
        createdBy: req.user.id
    });

    res.status(201).json(test);
});

// @desc    Get Test by ID
// @route   GET /api/student/test/:id
// @access  Private/Student
const getTestById = asyncHandler(async (req, res) => {
    const test = await Test.findById(req.params.id)
        .populate('questions', '-options.isCorrect -testCases.output -testCases.isHidden');

    if (test) {
        res.json(test);
    } else {
        res.status(404);
        throw new Error('Test not found');
    }
});

// @desc    Get User Profile with Stats
// @route   GET /api/student/profile
// @access  Private/Student
const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const attempts = await UserAttempt.find({ userId }).populate('testId');

    // Basic Stats
    const testsTaken = attempts.length;
    const totalScore = attempts.reduce((sum, att) => sum + att.score, 0);
    const averageScore = testsTaken > 0 ? totalScore / testsTaken : 0;

    // Calculate Level
    let level = 'Beginner';
    if (testsTaken >= 30 && averageScore >= 85) level = 'Expert';
    else if (testsTaken >= 15 && averageScore >= 70) level = 'Advanced';
    else if (testsTaken >= 5 && averageScore >= 50) level = 'Intermediate';

    // Advanced Stats: Topic Mastery & Difficulty Breakdown
    const topicStats = {}; // { 'Arrays': { easy: {correct, total}, medium: {...}, hard: {...} } }

    // Helper to init stats
    const initDifficulty = () => ({ correct: 0, total: 0 });

    for (const attempt of attempts) {
        const fullAttempt = await UserAttempt.findById(attempt._id).populate('answers.questionId');
        if (fullAttempt && fullAttempt.answers) {
            fullAttempt.answers.forEach(ans => {
                const q = ans.questionId;
                if (q && q.topics) {
                    q.topics.forEach(topic => {
                        if (!topicStats[topic]) {
                            topicStats[topic] = {
                                easy: initDifficulty(),
                                medium: initDifficulty(),
                                hard: initDifficulty(),
                                totalCorrect: 0,
                                totalQuestions: 0
                            };
                        }

                        const difficulty = q.difficulty || 'medium'; // Default to medium if missing
                        topicStats[topic][difficulty].total += 1;
                        topicStats[topic].totalQuestions += 1;

                        if (ans.isCorrect) {
                            topicStats[topic][difficulty].correct += 1;
                            topicStats[topic].totalCorrect += 1;
                        }
                    });
                }
            });
        }
    }

    const topicMastery = Object.entries(topicStats).map(([topic, stats]) => ({
        topic,
        accuracy: Math.round((stats.totalCorrect / stats.totalQuestions) * 100),
        attempted: stats.totalQuestions,
        breakdown: {
            easy: { ...stats.easy, accuracy: stats.easy.total > 0 ? Math.round((stats.easy.correct / stats.easy.total) * 100) : 0 },
            medium: { ...stats.medium, accuracy: stats.medium.total > 0 ? Math.round((stats.medium.correct / stats.medium.total) * 100) : 0 },
            hard: { ...stats.hard, accuracy: stats.hard.total > 0 ? Math.round((stats.hard.correct / stats.hard.total) * 100) : 0 },
        }
    })).sort((a, b) => b.accuracy - a.accuracy);

    const scoreTrend = attempts.slice(-10).map(att => ({
        date: new Date(att.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: att.score
    }));

    const totalUsersInPlatform = await require('../models/User').countDocuments({ role: 'student' });

    res.json({
        user: {
            name: req.user.name,
            email: req.user.email,
            collegeId: req.user.collegeId,
            college: req.user.college,
            passingYear: req.user.passingYear,
            state: req.user.state,
            profileImage: req.user.profileImage,
            role: req.user.role
        },
        stats: {
            level,
            testsTaken,
            averageScore: Math.round(averageScore),
            totalQuestionsSolved: attempts.reduce((acc, att) => acc + att.answers.filter(a => a.isCorrect).length, 0),
            totalQuestionsAttempted: attempts.reduce((acc, att) => acc + att.answers.length, 0),
            totalUsersInPlatform
        },
        topicMastery,
        scoreTrend,
        recentAttempts: attempts.slice(-5).reverse().map(att => ({
            testId: att.testId,
            score: att.score,
            date: att.completedAt
        }))
    });
});

// @desc    Get Available Topics
// @route   GET /api/student/topics
// @access  Private/Student
const getTopics = asyncHandler(async (req, res) => {
    const topics = await Question.distinct('topics', { status: 'published' });
    res.json(topics.filter(t => t));
});

// @desc    Update User Profile
// @route   PUT /api/student/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await require('../models/User').findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.college = req.body.college || user.college;
        user.collegeId = req.body.collegeId || user.collegeId;
        user.passingYear = req.body.passingYear || user.passingYear;
        user.state = req.body.state || user.state;
        user.profileImage = req.body.profileImage || user.profileImage;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            college: updatedUser.college,
            collegeId: updatedUser.collegeId,
            passingYear: updatedUser.passingYear,
            state: updatedUser.state,
            profileImage: updatedUser.profileImage,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get documentation by ID
// @route   GET /api/student/documentation/:id
// @access  Private/Student
const getDocumentationById = asyncHandler(async (req, res) => {
    const doc = await Documentation.findById(req.params.id);
    if (!doc) {
        res.status(404);
        throw new Error('Documentation not found');
    }
    res.json(doc);
});

// @desc    Update Daily Activity (Time Spent)
// @route   POST /api/student/activity/update
// @access  Private/Student
const updateActivityStats = asyncHandler(async (req, res) => {
    const { timeSpent = 0 } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const userId = req.user.id;

    let activity = await UserActivity.findOne({ userId, date: today });
    if (!activity) {
        activity = new UserActivity({ userId, date: today });
    }

    // Convert seconds to Number
    activity.timeSpent += Number(timeSpent);

    // Check completion (30 min = 1800 sec, or 2 questions)
    if (!activity.isCompleted && (activity.timeSpent >= 1800 || activity.questionsSolved >= 2)) {
        activity.isCompleted = true;

        // Update User Streak
        const user = await User.findById(userId);
        if (user.lastActivityDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (user.lastActivityDate === yesterdayStr) {
                user.currentStreak += 1;
            } else {
                user.currentStreak = 1;
            }

            if (user.currentStreak > user.longestStreak) {
                user.longestStreak = user.currentStreak;
            }
            user.lastActivityDate = today;
            await user.save();
        }
    }

    await activity.save();
    res.json(activity);
});

// @desc    Get Activity Log
// @route   GET /api/student/activity/log
// @access  Private/Student
const getActivityLog = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    // Get last 30 activities
    const activities = await UserActivity.find({ userId }).sort({ date: -1 }).limit(35);
    const user = await User.findById(userId).select('currentStreak longestStreak lastActivityDate');

    res.json({
        activities,
        streak: {
            current: user.currentStreak,
            longest: user.longestStreak,
            lastActivity: user.lastActivityDate
        }
    });
});

// @desc    Report a Question
// @route   POST /api/student/question/report
// @access  Private/Student
const reportQuestion = asyncHandler(async (req, res) => {
    const { questionId, reason } = req.body;

    if (!questionId || !reason) {
        res.status(400);
        throw new Error('Please provide questionId and reason');
    }

    const report = await ReportedQuestion.create({
        questionId,
        userId: req.user.id,
        reason
    });

    res.status(201).json(report);
});

// @desc    Get Questions for Specific Day in Plan
// @route   GET /api/student/plan/day/:dayNumber/questions
// @access  Private/Student
const getDayQuestions = asyncHandler(async (req, res) => {
    const { dayNumber } = req.params;
    const day = parseInt(dayNumber);

    if (!day || day < 1 || day > 7) {
        res.status(400);
        throw new Error('Invalid day number. Must be between 1 and 7.');
    }

    // Get the user's latest improvement plan
    const lastAttempt = await UserAttempt.findOne({ userId: req.user.id })
        .sort({ createdAt: -1 });

    if (!lastAttempt) {
        res.status(404);
        throw new Error('No diagnostic test found. Please take a diagnostic test first.');
    }

    // Regenerate the plan logic to get the specific day's questions
    // This is a simplified version - in production, you might want to cache the plan
    const plan = await generatePlanForUser(req.user.id);

    if (!plan || !plan.plan || !plan.plan[day - 1]) {
        res.status(404);
        throw new Error('Day not found in plan');
    }

    const dayPlan = plan.plan[day - 1];

    // Fetch full question details
    const questionIds = dayPlan.assignedQuestions || [];

    if (questionIds.length === 0) {
        res.status(404);
        throw new Error('No questions available for this day');
    }

    const questions = await Question.find({
        _id: { $in: questionIds },
        status: 'published'
    }).select('-options.isCorrect -testCases.output -testCases.isHidden');

    // Create a test record for tracking
    const test = await Test.create({
        type: 'WEEKLY',
        duration: calculateDuration(questions),
        questions: questionIds,
        createdBy: req.user.id
    });

    const populatedTest = await Test.findById(test._id)
        .populate('questions', '-options.isCorrect -testCases.output -testCases.isHidden');

    res.json(populatedTest);
});

// Helper function to generate plan (extracted logic)
const generatePlanForUser = async (userId) => {
    const lastAttempt = await UserAttempt.findOne({ userId })
        .sort({ createdAt: -1 })
        .populate({
            path: 'answers.questionId',
            select: 'topics topic difficulty type title'
        })
        .populate({
            path: 'testId',
            populate: {
                path: 'questions',
                select: 'topic topics difficulty type'
            }
        });

    if (!lastAttempt) return null;

    const attemptedQuestionIds = new Set(lastAttempt.answers.map(ans => ans.questionId?._id?.toString()));
    const unattemptedQuestions = lastAttempt.testId?.questions.filter(q => !attemptedQuestionIds.has(q._id.toString())) || [];

    const topicStats = {};
    lastAttempt.answers.forEach(ans => {
        const question = ans.questionId;
        if (question) {
            const t = question.topic || (question.topics && question.topics[0]);
            if (t) {
                if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0, unattempted: 0, incorrect: 0 };
                topicStats[t].total += 1;
                if (ans.isCorrect) {
                    topicStats[t].correct += 1;
                } else {
                    topicStats[t].incorrect += 1;
                }
            }
        }
    });

    unattemptedQuestions.forEach(q => {
        const t = q.topic || (q.topics && q.topics[0]);
        if (t) {
            if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0, unattempted: 0, incorrect: 0 };
            topicStats[t].total += 1;
            topicStats[t].unattempted += 1;
        }
    });

    for (const [topic, stats] of Object.entries(topicStats)) {
        stats.weaknessScore = stats.total > 0 ? (stats.incorrect + stats.unattempted) / stats.total : 0;
    }

    const sortedByWeakness = Object.entries(topicStats)
        .sort((a, b) => b[1].weaknessScore - a[1].weaknessScore);

    const focusTopics = sortedByWeakness.slice(0, 2).map(([topic]) => topic);
    if (focusTopics.length === 0) {
        focusTopics.push("General Aptitude", "Programming Basics");
    }

    const dailyTasks = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() + i + 1);
        const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });

        let topic;
        if (i < 3) {
            topic = focusTopics[0];
        } else if (i < 6) {
            topic = focusTopics[1] || focusTopics[0];
        } else {
            topic = focusTopics[0];
        }

        const topicRegex = new RegExp(`^${topic.trim()}$`, 'i');
        const mcqQuestions = await Question.aggregate([
            {
                $match: {
                    status: 'published',
                    type: 'MCQ',
                    $or: [
                        { topic: topicRegex },
                        { topics: topicRegex }
                    ]
                }
            },
            { $sample: { size: 4 } }
        ]);

        const codingQuestions = await Question.aggregate([
            {
                $match: {
                    status: 'published',
                    type: 'CODING',
                    $or: [
                        { topic: topicRegex },
                        { topics: topicRegex }
                    ]
                }
            },
            { $sample: { size: 1 } }
        ]);

        dailyTasks.push({
            day: `Day ${i + 1}`,
            dayNumber: i + 1,
            date: dayDate.toISOString().split('T')[0],
            dayName: dayName,
            topic: topic,
            assignedQuestions: [...mcqQuestions.map(q => q._id), ...codingQuestions.map(q => q._id)],
            link: `/student/test/daily/${i + 1}`
        });
    }

    return { plan: dailyTasks, focusTopics };
};

// Helper to calculate test duration
const calculateDuration = (questions) => {
    let totalDuration = 0;
    questions.forEach(q => {
        if (q.type === 'MCQ') {
            totalDuration += 2;
        } else if (q.type === 'CODING') {
            totalDuration += (q.expectedTime || 15);
        }
    });
    return totalDuration || questions.length * 5;
};


module.exports = {
    generateDiagnosticTest,
    submitTest,
    getImprovementPlan,
    createCustomTest,
    getTestById,
    getUserProfile,
    getTopics,
    updateProfile,
    getDocumentationById,
    updateActivityStats,
    getActivityLog,
    reportQuestion,
    getDayQuestions
};
