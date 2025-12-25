const asyncHandler = require('express-async-handler');
const Question = require('../models/Question');
const Test = require('../models/Test');
const UserAttempt = require('../models/UserAttempt');
const Documentation = require('../models/Documentation');

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

    // 2. Analyze Performance
    const topicStats = {}; // { 'Arrays': { correct: 2, total: 3, unattempted: 1 } }
    let totalCorrect = 0;

    // Process attempted answers
    lastAttempt.answers.forEach(ans => {
        const question = ans.questionId;
        if (question) {
            if (ans.isCorrect) totalCorrect++;

            // Use 'topic' or first element of 'topics'
            const t = question.topic || (question.topics && question.topics[0]);
            if (t) {
                if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0, unattempted: 0 };
                topicStats[t].total += 1;
                if (ans.isCorrect) topicStats[t].correct += 1;
            }
        }
    });

    // Process unattempted questions (mark as weak areas)
    unattemptedQuestions.forEach(q => {
        const t = q.topic || (q.topics && q.topics[0]);
        if (t) {
            if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0, unattempted: 0 };
            topicStats[t].total += 1;
            topicStats[t].unattempted += 1;
        }
    });

    // 3. Identify Weak & Strong Areas
    const weakTopics = [];
    const strongTopics = [];

    for (const [topic, stats] of Object.entries(topicStats)) {
        // If unattempted > 0 or accuracy < 60, it's a weak topic
        const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
        if (stats.unattempted > 0 || accuracy < 60) {
            weakTopics.push(topic);
        } else if (accuracy >= 80) {
            strongTopics.push(topic);
        }
    }

    // 4. Generate Motivation
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
        // Fallback for custom tests or missing test data
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

    // 5. Build 7-Day Plan
    const dailyTasks = [];
    const today = new Date();

    // Select up to 7 topics from weak topics (or repeat if needed)
    const focusTopics = weakTopics.length > 0 ? weakTopics : ["General Aptitude", "Programming Basics"];

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() + i + 1);
        const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });

        const topic = focusTopics[i % focusTopics.length];
        const doc = await Documentation.findOne({
            $or: [
                { topic: new RegExp(`^${topic}$`, 'i') },
                { title: new RegExp(topic, 'i') }
            ]
        });

        dailyTasks.push({
            day: `Day ${i + 1}`,
            date: dayDate.toISOString().split('T')[0],
            dayName: dayName,
            topic: topic,
            tasks: [
                { type: 'READ', description: `Study ${topic} documentation and core concepts.`, resource: doc ? { title: doc.title, id: doc._id } : null },
                { type: 'PRACTICE_MCQ', description: `Solve 2-4 MCQ questions on ${topic}.`, target: "2-4 MCQs" },
                { type: 'PRACTICE_CODING', description: `Complete 1 coding challenge on ${topic}.`, target: "1 Coding" }
            ],
            link: `/student/test/custom?topic=${encodeURIComponent(topic)}`
        });
    }

    res.json({
        attemptId: lastAttempt._id,
        score: lastAttempt.score,
        percentage: Math.round(percentage),
        totalQuestions: totalQuestionsCount,
        correctQuestions: totalCorrect,
        motivation,
        analysis: {
            weak: weakTopics,
            strong: strongTopics
        },
        plan: dailyTasks
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

module.exports = {
    generateDiagnosticTest,
    submitTest,
    getImprovementPlan,
    createCustomTest,
    getTestById,
    getUserProfile,
    getTopics,
    updateProfile,
    getDocumentationById
};
