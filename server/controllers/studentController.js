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

    // Define 5 basic topics for the diagnostic test
    const DIAGNOSTIC_TOPICS = [
        'HTML',
        'CSS',
        'JavaScript Basics',
        'General Aptitude',
        'Computer Networks'
    ];
    // Create regex for case-insensitive matching
    const topicRegexes = DIAGNOSTIC_TOPICS.map(t => new RegExp(t, 'i'));

    // Helper to pick random questions
    const pickQuestions = async (type, difficulty, count) => {
        const questions = await Question.aggregate([
            {
                $match: {
                    status: 'published',
                    type: type,
                    difficulty: difficulty,
                    // Filter by our specific list of easy topics
                    $or: [
                        { topic: { $in: topicRegexes } },
                        { topics: { $in: topicRegexes } }
                    ],
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

    // 1. Pick MCQs: Focus heavily on EASY
    // 15 Easy, 5 Medium (Total 20)
    await pickQuestions('MCQ', 'easy', 15);
    await pickQuestions('MCQ', 'medium', 5);

    // 2. Pick Coding: 2 Easy, 1 Medium (Total 3)
    await pickQuestions('CODING', 'easy', 2);
    await pickQuestions('CODING', 'medium', 1);

    // 3. Fallback: If total is less than target (23), fill with ANY 'easy' published questions
    if (selectedQuestions.length < 23) {
        const needed = 23 - selectedQuestions.length;
        const extraQuestions = await Question.aggregate([
            {
                $match: {
                    status: 'published',
                    difficulty: 'easy',
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

    // 4. Create Test Record
    const test = await Test.create({
        type: 'DIAGNOSTIC',
        duration: 60, // 60 mins for predominantly easy questions
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
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne() || { global: { mcqPoints: 1, codingPoints: 10 } };

    test.questions.forEach(q => {
        const diff = (q.difficulty || 'medium').toLowerCase();
        let marks = 0;
        if (q.type === 'MCQ') {
            marks = settings.global.mcqPoints || 1;
            if (diff === 'medium') marks *= 2;
            else if (diff === 'hard') marks *= 3;
        } else if (q.type === 'CODING') {
            marks = settings.global.codingPoints || 20;
            if (diff === 'medium') marks *= 2;
            else if (diff === 'hard') marks *= 3;
        }
        maxPossibleScore += marks;
    });

    for (const ans of answers) {
        const question = test.questions.find(q => q._id.toString() === ans.questionId);
        let isCorrect = false;
        let executionResults = [];
        let questionScore = 0;
        let questionMaxScore = 0;

        if (question) {
            // Determine marks based on difficulty (normalized)
            let marks = 0;
            const diff = (question.difficulty || 'medium').toLowerCase();

            if (question.type === 'MCQ') {
                marks = settings.global.mcqPoints || 1;
                if (diff === 'medium') marks *= 2;
                else if (diff === 'hard') marks *= 3;
            } else if (question.type === 'CODING') {
                marks = settings.global.codingPoints || 20;
                if (diff === 'medium') marks *= 2;
                else if (diff === 'hard') marks *= 3;
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
            executionResults,
            topic: question.topic || (question.topics && question.topics[0]),
            type: question.type,
            difficulty: question.difficulty
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
        totalTime: req.body.totalTime || answers.reduce((acc, curr) => acc + (curr.timeTaken || 0), 0),
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
    // Generate Plan (which now uses aggregated stats)
    const planData = await generatePlanForUser(req.user.id);
    const dailyTasks = planData ? planData.plan : [];
    const focusTopics = planData ? planData.focusTopics : ["General Aptitude", "Programming Basics"];

    // Analyze Weak & Strong Areas based on the AGGREGATED stats from the plan generator (re-deriving or passing them would be better, but we can re-calc for display quickly or just trust the focus topics as weak)
    // To be cleaner, we should probably have generatePlanForUser return the full stats. 
    // For now, let's re-use the robust focus topics as "Weak" and find "Strong" ones.

    const weakTopics = focusTopics; // The plan generator already picked the weakest ones.
    const strongTopics = [];
    // We need to fetch the stats again if we want to show "Strong" ones accurately, or update generatePlanForUser to return them.
    // Let's rely on the planData having what we need. 
    // *Self-Correction*: I should update generatePlanForUser to return stats to avoid double-querying. 
    // For this immediate step, let's just assume we want to show the top weak ones. 
    // To get strong ones, let's grab the topicStats from the same logic.

    // *Quick Refactor*: Let's pull the stats logic into generatePlanForUser so we don't duplicate. 
    // Actually, let's just make sure we pass the 'analysis' object correctly.

    // Let's trust the `planData` has `focusTopics`. We will populate `strongTopics` by checking the other end of the sorted list in `generatePlanForUser` if we could, 
    // but without changing the helper signature too much, let's just do a quick fetch here for display to ensure it matches the "Real Time" requirement.

    try {
        // Re-fetch for display stats (using same logic as helper)
        const recentAttempts = await UserAttempt.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate({
                path: 'answers.questionId',
                select: 'topics topic difficulty type'
            });

        const topicStats = {};
        recentAttempts.forEach(attempt => {
            if (attempt.answers && Array.isArray(attempt.answers)) {
                attempt.answers.forEach(ans => {
                    const question = ans.questionId;
                    if (question) {
                        // Robust topic extraction
                        let topics = [];
                        if (question.topics && question.topics.length > 0) {
                            topics = question.topics;
                        } else if (question.topic) {
                            topics = [question.topic];
                        }

                        if (topics.length === 0) topics = ['General Practice'];

                        topics.forEach(t => {
                            if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0 };
                            topicStats[t].total += 1;
                            if (ans.isCorrect) topicStats[t].correct += 1;
                        });
                    }
                });
            }
        });

        for (const [topic, stats] of Object.entries(topicStats)) {
            stats.accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
            if (stats.accuracy >= 0.8 && stats.total >= 3) {
                strongTopics.push(topic);
            }
        }
    } catch (err) {
        console.error("Error analyzing weak/strong topics:", err);
    }

    // 5. Generate Motivation
    let maxPossibleScore = 0;
    try {
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
    } catch (err) {
        console.error("Error calculating max score:", err);
        maxPossibleScore = lastAttempt.score || 10;
    }

    const percentage = maxPossibleScore > 0 ? (lastAttempt.score / maxPossibleScore) * 100 : 0;
    const totalQuestionsCount = (lastAttempt.testId?.questions?.length) || lastAttempt.answers.length;
    const totalCorrect = lastAttempt.answers ? lastAttempt.answers.filter(a => a.isCorrect).length : 0;

    let motivation = '';
    if (percentage < 40) {
        motivation = "Don't be discouraged! Every expert was once a beginner. Focus on the basics and complete your daily tasks.";
    } else if (percentage < 70) {
        motivation = "Good progress! You're getting there. Consistency will help you bridge the gap in your weak areas.";
    } else {
        motivation = "Excellent performance! Keep challenging yourself with complex problems to stay on top.";
    }

    // Plan is already generated by helper
    // const dailyTasks = ... (removed)

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

    // Optimized fetch: populate everything in one go
    const attempts = await UserAttempt.find({ userId })
        .populate('testId')
        .populate('answers.questionId')
        .sort({ completedAt: -1 });

    // Basic Stats
    const testsTaken = attempts.length;
    const totalScore = attempts.reduce((sum, att) => sum + att.score, 0);
    const averageScore = testsTaken > 0 ? totalScore / testsTaken : 0;

    // Calculate Level
    let level = 'Beginner';
    if (testsTaken >= 30 && averageScore >= 85) level = 'Expert';
    else if (testsTaken >= 15 && averageScore >= 70) level = 'Advanced';
    else if (testsTaken >= 5 && averageScore >= 50) level = 'Intermediate';

    // Advanced Stats: Topic Mastery
    const topicStats = {};
    const initDifficulty = () => ({ correct: 0, total: 0 });

    attempts.forEach(attempt => {
        if (attempt.answers) {
            attempt.answers.forEach(ans => {
                const q = ans.questionId;
                if (q) {
                    // Normalize topics: Use topics array if available/non-empty, else singleton topic
                    let topics = [];
                    if (q.topics && q.topics.length > 0) {
                        topics = q.topics;
                    } else if (q.topic) {
                        topics = [q.topic];
                    }

                    // Fallback for missing topics if needed (e.g. from Custom tests without specific topic metadata?)
                    // If no topic, maybe categorize as 'General'?
                    if (topics.length === 0) topics = ['General Practice'];

                    topics.forEach(topic => {
                        if (!topicStats[topic]) {
                            topicStats[topic] = {
                                easy: initDifficulty(),
                                medium: initDifficulty(),
                                hard: initDifficulty(),
                                totalCorrect: 0,
                                totalQuestions: 0
                            };
                        }

                        const difficulty = (q.difficulty || 'medium').toLowerCase();
                        // Handle case mismatch or new difficulties
                        const validDiff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';

                        topicStats[topic][validDiff].total += 1;
                        topicStats[topic].totalQuestions += 1;

                        if (ans.isCorrect) {
                            topicStats[topic][validDiff].correct += 1;
                            topicStats[topic].totalCorrect += 1;
                        }
                    });
                }
            });
        }
    });

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

    // Score Trend (reversed to show chronologically)
    const scoreTrend = attempts.slice(0, 10).reverse().map(att => ({
        date: new Date(att.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: att.score,
        percentage: att.maxScore > 0 ? Math.round((att.score / att.maxScore) * 100) : 0
    }));

    // Ranking Logic (Real-Time Leaderboard)
    // Aggregate total scores for all students
    const leaderboard = await UserAttempt.aggregate([
        {
            $group: {
                _id: "$userId",
                totalScore: { $sum: "$score" }
            }
        },
        { $sort: { totalScore: -1 } }
    ]);

    const totalUsers = await User.countDocuments({ role: 'student' });

    // Find current user's rank
    const userRankIndex = leaderboard.findIndex(entry => entry._id.toString() === userId.toString());
    const globalRank = userRankIndex !== -1 ? userRankIndex + 1 : totalUsers;

    // Time Management Analysis
    const timeStats = {
        easy: { totalTime: 0, count: 0 },
        medium: { totalTime: 0, count: 0 },
        hard: { totalTime: 0, count: 0 }
    };

    attempts.forEach(att => {
        att.answers?.forEach(ans => {
            if (ans.timeTaken > 0) {
                const diff = (ans.questionId?.difficulty || 'medium').toLowerCase();
                if (timeStats[diff]) {
                    timeStats[diff].totalTime += ans.timeTaken;
                    timeStats[diff].count += 1;
                }
            }
        });
    });

    const timeAnalysis = {
        easy: timeStats.easy.count > 0 ? Math.round(timeStats.easy.totalTime / timeStats.easy.count) : 0,
        medium: timeStats.medium.count > 0 ? Math.round(timeStats.medium.totalTime / timeStats.medium.count) : 0,
        hard: timeStats.hard.count > 0 ? Math.round(timeStats.hard.totalTime / timeStats.hard.count) : 0,
        insights: []
    };

    // Generate Insights based on benchmarks
    // Benchmarks (in seconds): Easy < 60, Medium < 180, Hard < 600
    if (timeAnalysis.easy > 120) timeAnalysis.insights.push("Try to solve Easy questions under 2 minutes to save time for complex problems.");
    else if (timeAnalysis.easy > 0 && timeAnalysis.easy < 45) timeAnalysis.insights.push("Excellent speed on Easy questions!");

    if (timeAnalysis.medium > 300) timeAnalysis.insights.push("You're taking a bit long on Medium questions. Practice identifying patterns faster.");
    else if (timeAnalysis.medium > 0 && timeAnalysis.medium < 150) timeAnalysis.insights.push("Great pace on Medium level problems.");

    if (timeAnalysis.hard > 900) timeAnalysis.insights.push("Hard problems are consuming too much time. Focus on breaking them down into smaller sub-problems.");

    // Activity Log
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const dailyActivity = await UserActivity.find({
        userId,
        date: { $gte: weekAgo.toISOString().split('T')[0] }
    }).sort({ date: 1 });

    res.json({
        user: {
            name: req.user.name,
            email: req.user.email,
            collegeId: req.user.collegeId,
            college: req.user.college,
            passingYear: req.user.passingYear,
            state: req.user.state,
            profileImage: req.user.profileImage,
            role: req.user.role,
            currentStreak: req.user.currentStreak || 0,
            longestStreak: req.user.longestStreak || 0
        },
        stats: {
            level,
            testsTaken,
            averageScore: Math.round(averageScore),
            totalQuestionsSolved: attempts.reduce((acc, att) => acc + (att.answers?.filter(a => a.isCorrect).length || 0), 0),
            totalQuestionsAttempted: attempts.reduce((acc, att) => acc + (att.answers?.length || 0), 0),
            globalRank,
            totalUsers,
            timeAnalysis // New Field
        },
        topicMastery,
        scoreTrend,
        dailyActivity: dailyActivity.map(a => ({
            date: a.date,
            timeSpent: Math.round(a.timeSpent / 60), // in mins
            questionsSolved: a.questionsSolved
        })),
        recentAttempts: attempts.slice(0, 5).map(att => {
            // Fix Title Logic
            let title = 'Custom Test';
            if (att.testId) {
                if (att.testId.type === 'DIAGNOSTIC') title = 'Diagnostic Test';
                else if (att.testId.type === 'WEEKLY') title = 'Weekly Upgrade';
                else {
                    // Try to get topic from first answer
                    const firstTopic = att.answers?.[0]?.questionId?.topic || att.answers?.[0]?.questionId?.topics?.[0];
                    if (firstTopic) title = `${firstTopic} Practice`;
                }
            }

            // Fix Total Count (Test Questions vs Attempted)
            const realTotalQuestions = att.testId?.questions?.length || att.answers?.length || 0;

            // Fix Percentage (Cap at 100%)
            const rawPct = att.maxScore > 0 ? (att.score / att.maxScore) * 100 : 0;
            const percentage = Math.round(rawPct > 100 ? 100 : rawPct);

            return {
                _id: att._id,
                testId: att.testId?._id,
                testTitle: title,
                score: att.score,
                maxScore: att.maxScore,
                correctCount: att.answers?.filter(a => a.isCorrect).length || 0,
                totalCount: realTotalQuestions,
                date: att.completedAt
            };
        })
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

// @desc    Get All Test Attempts for User
// @route   GET /api/student/attempts
// @access  Private/Student
const getUserAttempts = asyncHandler(async (req, res) => {
    const attempts = await UserAttempt.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .populate('testId', 'type duration')
        .select('score totalTime completedAt testId createdAt');

    // Calculate additional stats for each attempt
    const attemptsWithStats = attempts.map(attempt => {
        let maxScore = 0;
        const topicMap = {};

        attempt.answers?.forEach(ans => {
            // Robust maxScore calculation
            let qMax = ans.maxScore || 0;
            if (!qMax) {
                // Fallback based on difficulty if maxScore missing in answer
                const diff = (ans.difficulty || 'medium').toLowerCase();
                const type = ans.type || 'MCQ';
                if (type === 'MCQ') {
                    qMax = diff === 'easy' ? 1 : diff === 'medium' ? 2 : 3;
                } else {
                    qMax = diff === 'easy' ? 5 : diff === 'medium' ? 10 : 15;
                }
            }
            maxScore += qMax;

            const t = ans.topic || 'General';
            if (!topicMap[t]) topicMap[t] = { correct: 0, total: 0 };
            topicMap[t].total += 1;
            if (ans.isCorrect) topicMap[t].correct += 1;
        });

        // Fix 300% bug: Ensure maxScore is at least the score (sanity check) or 1 to avoid /0
        if (maxScore < attempt.score) maxScore = attempt.score; // Should not happen but safety first
        if (maxScore === 0 && attempt.score > 0) maxScore = attempt.score;

        const percentage = maxScore > 0 ? Math.round((attempt.score / maxScore) * 100) : 0;

        const topicBreakdown = Object.entries(topicMap).map(([topic, stats]) => ({
            topic,
            ...stats
        }));

        return {
            _id: attempt._id,
            testType: attempt.testId?.type || 'CUSTOM',
            score: attempt.score,
            maxScore,
            percentage: Math.min(percentage, 100), // Cap at 100%
            totalTime: attempt.totalTime,
            completedAt: attempt.completedAt || attempt.createdAt,
            questionCount: attempt.answers?.length || 0,
            topicBreakdown,
            correctCount: attempt.answers?.filter(a => a.isCorrect).length || 0,
            wrongCount: (attempt.answers?.length || 0) - (attempt.answers?.filter(a => a.isCorrect).length || 0)
        };
    });

    res.json(attemptsWithStats);
});

// @desc    Get Coding Practice Questions by Topic
// @route   GET /api/student/practice/coding
// @access  Private/Student
const getCodingPracticeQuestions = asyncHandler(async (req, res) => {
    const { topic } = req.query;

    if (!topic) {
        res.status(400);
        throw new Error('Topic is required');
    }

    const topicRegex = new RegExp(topic, 'i');
    const questions = await Question.find({
        status: 'published',
        type: 'CODING',
        $or: [
            { topic: topicRegex },
            { topics: topicRegex }
        ]
    }).select('-testCases.output -testCases.isHidden');

    // Create a temporary test object to reuse TestAttempt UI
    const test = {
        _id: 'practice_' + Date.now(),
        type: 'PRACTICE',
        title: `Practice: ${topic}`,
        duration: questions.length * 15, // 15 mins per coding problem
        questions: questions
    };

    res.json(test);
});

// @desc    Get Detailed Test Attempt for Review
// @route   GET /api/student/attempt/:attemptId
// @access  Private/Student
const getTestAttemptDetails = asyncHandler(async (req, res) => {
    const attempt = await UserAttempt.findById(req.params.attemptId)
        .populate({
            path: 'answers.questionId',
            select: 'title description type difficulty options explanation codeSnippet codeLanguage testCases inputFormat outputFormat constraints topic topics'
        })
        .populate('testId', 'type duration');

    if (!attempt) {
        res.status(404);
        throw new Error('Test attempt not found');
    }

    // Verify this attempt belongs to the requesting user
    if (attempt.userId.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to view this attempt');
    }

    // Build detailed answers with correct answers and explanations
    const detailedAnswers = attempt.answers.map(ans => {
        const question = ans.questionId;
        if (!question) {
            return {
                ...ans.toObject(),
                questionNotFound: true
            };
        }

        let correctAnswer = null;
        let userAnswerText = null;

        if (question.type === 'MCQ') {
            // Find correct option
            const correctIdx = question.options.findIndex(opt => opt.isCorrect);
            correctAnswer = {
                index: correctIdx,
                text: question.options[correctIdx]?.text || 'N/A'
            };

            // Get user's answer text
            if (ans.selectedOption !== undefined && ans.selectedOption !== null) {
                userAnswerText = question.options[ans.selectedOption]?.text || 'Invalid option';
            }
        } else if (question.type === 'CODING') {
            // For coding, we don't show a "correct answer" but show their code
            userAnswerText = ans.userAnswer || ans.code || 'No code submitted';
        }

        return {
            questionId: question._id,
            title: question.title,
            description: question.description,
            type: question.type,
            difficulty: question.difficulty,
            topic: question.topic || (question.topics && question.topics[0]) || 'General',
            options: question.options,
            codeSnippet: question.codeSnippet,
            codeLanguage: question.codeLanguage,
            inputFormat: question.inputFormat,
            outputFormat: question.outputFormat,
            constraints: question.constraints,
            userAnswer: userAnswerText,
            userCode: ans.code,
            selectedOption: ans.selectedOption,
            correctAnswer,
            isCorrect: ans.isCorrect,
            score: ans.score,
            maxScore: ans.maxScore,
            timeTaken: ans.timeTaken,
            explanation: question.explanation,
            showExplanation: !ans.isCorrect && question.explanation, // Only show for wrong answers
            executionResults: ans.executionResults
        };
    });

    // Calculate overall stats
    const totalQuestions = detailedAnswers.length;
    const correctCount = detailedAnswers.filter(a => a.isCorrect).length;
    const wrongCount = totalQuestions - correctCount;
    const maxScore = attempt.answers.reduce((acc, ans) => acc + (ans.maxScore || 0), 0);
    const percentage = maxScore > 0 ? Math.round((attempt.score / maxScore) * 100) : 0;

    res.json({
        attemptId: attempt._id,
        testType: attempt.testId?.type || 'CUSTOM',
        completedAt: attempt.completedAt || attempt.createdAt,
        totalTime: attempt.totalTime,
        stats: {
            score: attempt.score,
            maxScore,
            percentage,
            totalQuestions,
            correctCount,
            wrongCount
        },
        questions: detailedAnswers
    });
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
    const isHardMode = false; // Default to false for now
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

    // Aggregated Analysis: Fetch last 20 attempts for stable stats
    const recentAttempts = await UserAttempt.find({ userId })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate({
            path: 'answers.questionId',
            select: 'topics topic difficulty type'
        });

    if (recentAttempts.length === 0) return null;

    const topicStats = {};

    // Helper to update stats
    const updateTopicStats = (topic, isCorrect, isSkipped) => {
        if (!topic) return;
        if (!topicStats[topic]) {
            topicStats[topic] = { correct: 0, total: 0, incorrect: 0, skipped: 0 };
        }
        topicStats[topic].total += 1;
        if (isCorrect) {
            topicStats[topic].correct += 1;
        } else {
            // Treat skipped as incorrect for weakness purpose, but track separately
            topicStats[topic].incorrect += 1;
            if (isSkipped) topicStats[topic].skipped += 1;
        }
    };

    // Process all recent attempts
    recentAttempts.forEach(attempt => {
        if (attempt.answers && Array.isArray(attempt.answers)) {
            attempt.answers.forEach(ans => {
                const question = ans.questionId;
                if (question) {
                    // Normalize topics
                    let topics = [];
                    if (question.topics && question.topics.length > 0) {
                        topics = question.topics;
                    } else if (question.topic) {
                        topics = [question.topic];
                    }

                    if (topics.length === 0) topics = ['General Practice'];

                    // Check if answer is "skipped" (empty or null)
                    const isSkipped = (ans.userAnswer === null || ans.userAnswer === undefined || ans.userAnswer === '');

                    topics.forEach(t => updateTopicStats(t, ans.isCorrect, isSkipped));
                }
            });
        }
    });

    // Calculate Scores
    for (const [topic, stats] of Object.entries(topicStats)) {
        // Weakness score: weighted towards incorrect answers
        // If accuracy < 60%, it's a candidate for weakness
        const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
        stats.accuracy = accuracy;
        // Weakness Score: Higher is weaker. 
        // We boost weakness score if they are skipping a lot (fear of topic?)
        const Settings = require('../models/Settings');
        const settings = await Settings.findOne() || { ai: { weaknessSensitivity: 0.5 } };
        const sensitivity = settings.ai?.weaknessSensitivity || 0.5;

        const skipRate = stats.total > 0 ? stats.skipped / stats.total : 0;
        stats.weaknessScore = (1 - accuracy) + (skipRate * sensitivity);
    }

    const sortedByWeakness = Object.entries(topicStats)
        .sort((a, b) => b[1].weaknessScore - a[1].weaknessScore);

    // Filter for actual weak areas (accuracy < 70%)
    const weakTopicsList = sortedByWeakness
        .filter(([_, stats]) => stats.accuracy < 0.7)
        .map(([topic]) => topic);

    // If no specific weak topics found (all > 70%), pick the ones with lowest accuracy anyway
    // If still empty (no data?), fallback.
    let focusTopics = weakTopicsList.slice(0, 2);

    if (focusTopics.length === 0) {
        // If everything is great, maybe focus on "Advanced" topics or just the "Least Strong" ones
        focusTopics = sortedByWeakness.slice(0, 2).map(([topic]) => topic);
    }

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

        // Determine difficulty for this day
        // Hard Mode: Always HARD
        // Normal Mode: Days 1-2 Easy, 3-5 Medium, 6-7 Hard/Mixed
        let dayDifficulty = 'medium';
        if (isHardMode) {
            dayDifficulty = 'hard';
        } else {
            if (i < 2) dayDifficulty = 'easy';
            else if (i < 5) dayDifficulty = 'medium';
            else dayDifficulty = 'hard';
        }

        const topicRegex = new RegExp(`^${topic.trim()}$`, 'i');

        // Build Match Query
        const matchQuery = {
            status: 'published',
            $or: [
                { topic: topicRegex },
                { topics: topicRegex }
            ]
        };

        matchQuery.difficulty = dayDifficulty;

        const mcqQuestions = await Question.aggregate([
            { $match: { ...matchQuery, type: 'MCQ' } },
            { $sample: { size: 4 } }
        ]);

        const codingQuestions = await Question.aggregate([
            { $match: { ...matchQuery, type: 'CODING' } },
            { $sample: { size: 1 } }
        ]);

        // Look for Documentation/Resources for this topic (New Feature)
        const documentation = await Documentation.findOne({
            topic: topicRegex
        }).select('_id title difficulty');

        // Generate Tasks for UI
        const tasks = [];

        // Task 1: Reading/Concept
        tasks.push({
            type: 'READ',
            description: documentation ? `Master ${documentation.title || topic}` : `Review concepts: ${topic}`,
            time: 15,
            resource: documentation ? {
                id: documentation._id,
                title: documentation.title,
                type: 'DOCUMENTATION'
            } : null
        });

        // Task 2: MCQs
        if (mcqQuestions.length > 0) {
            tasks.push({
                type: 'PRACTICE_MCQ',
                description: `Practice ${mcqQuestions.length} MCQs on ${topic}`,
                count: mcqQuestions.length,
                target: `${mcqQuestions.length} Questions`,
                time: mcqQuestions.length * 2
            });
        }

        // Task 3: Coding
        if (codingQuestions.length > 0) {
            tasks.push({
                type: 'PRACTICE_CODING',
                description: `Solve ${codingQuestions.length} Coding Problem`,
                count: codingQuestions.length,
                target: `1 Problem`,
                time: 15
            });
        }

        dailyTasks.push({
            day: `Day ${i + 1}`,
            dayNumber: i + 1,
            date: dayDate.toISOString().split('T')[0],
            dayName: dayName,
            topic: topic,
            difficulty: dayDifficulty, // Info only
            assignedQuestions: [...mcqQuestions.map(q => q._id), ...codingQuestions.map(q => q._id)],
            tasks: tasks,
            link: `/student/test/daily/${i + 1}`
        });
    }

    return { plan: dailyTasks, focusTopics, isHardMode };
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


// @desc    Generate Explanation for a Question using Gemini AI
// @route   POST /api/student/question/:id/explain
// @access  Private/Student
const generateQuestionExplanation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const question = await Question.findById(id);

    if (!question) {
        res.status(404);
        throw new Error('Question not found');
    }

    // 1. Check if explanation already exists
    if (question.explanation && question.explanation.length > 10) {
        return res.json({ explanation: question.explanation });
    }

    // 2. Generate with Gemini
    // 2. Generate with Gemini
    try {
        const Settings = require('../models/Settings');
        const settings = await Settings.findOne() || { ai: { promptTemperature: 0.7 } };
        const apiKey = settings.ai?.geminiApiKey || process.env.GEMINI_API_KEY;
        const temperature = settings.ai?.promptTemperature || 0.7;

        if (!apiKey) {
            throw new Error("Gemini API Key is missing. Please configure it in Admin Settings.");
        }

        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);

        const prompt = `Explain this ${question.type} question concisely for a student.
        Title: ${question.title}
        Description: ${question.description}
        ${question.type === 'MCQ' ? `Options: ${question.options.map(o => o.text).join(', ')}` : ''}
        ${question.codeSnippet ? `Code Snippet: ${question.codeSnippet}` : ''}
        
        Provide a short, direct explanation of the correct solution. Avoid lengthy introductions or conclusions. Maximum 3-4 sentences.`;

        let text = '';
        try {
            // Try 1.5 Flash first (most reliable)
            const model = genAI.getGenerativeModel({
                model: "gemini-flash-latest",
                generationConfig: { temperature }
            });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            text = response.text();
        } catch (err1) {
            console.warn("Gemini 1.5 Flash failed:", err1.message);
            throw err1;
        }

        // 3. Save to Database
        question.explanation = text;
        await question.save();

        res.json({ explanation: text });
    } catch (error) {
        console.error("Gemini API Error Detail:", error.message);
        // Send actual error to frontend for debugging
        res.status(500).json({
            message: 'Failed to generate explanation',
            error: error.message
        });
    }
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
    getDocumentationById,
    updateActivityStats,
    getActivityLog,
    reportQuestion,
    getDayQuestions,
    getUserAttempts,
    getTestAttemptDetails,
    getCodingPracticeQuestions,
    generateQuestionExplanation
};
