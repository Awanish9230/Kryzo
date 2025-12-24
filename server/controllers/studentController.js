const asyncHandler = require('express-async-handler');
const Question = require('../models/Question');
const Test = require('../models/Test');
const UserAttempt = require('../models/UserAttempt');

// @desc    Generate Diagnostic Test
// @route   GET /api/student/test/diagnostic
// @access  Private/Student
const generateDiagnosticTest = asyncHandler(async (req, res) => {
    // 1. Check if user already has a pending diagnostic test? (Optional optimization)

    // 2. Fetch random questions (e.g., 5 MCQ, 2 Coding)
    // Using simple aggregation $sample
    const mcqQuestions = await Question.aggregate([
        { $match: { status: 'published', type: 'MCQ' } },
        { $sample: { size: 5 } }
    ]);
    const codingQuestions = await Question.aggregate([
        { $match: { status: 'published', type: 'CODING' } },
        { $sample: { size: 2 } }
    ]);

    const questions = [...mcqQuestions, ...codingQuestions];

    if (questions.length === 0) {
        res.status(404);
        throw new Error('Not enough questions to generate test');
    }

    // 3. Create Test Record
    const test = await Test.create({
        type: 'DIAGNOSTIC',
        duration: 60, // 60 mins default
        questions: questions.map(q => q._id),
        createdBy: req.user.id // Generated for this user
    });

    // Populate question details for response
    // We already have question objects, but to be consistent/clean, we can refetch or just send formatted
    // But Test model stores IDs.

    // Return full test with populated questions
    const populatedTest = await Test.findById(test._id).populate('questions', '-options.isCorrect -testCases.output -testCases.isHidden');

    res.status(201).json(populatedTest);
});

// @desc    Submit Test Attempt
// @route   POST /api/student/test/submit
// @access  Private/Student
const submitTest = asyncHandler(async (req, res) => {
    const { testId, answers } = req.body;
    // answers: [{ questionId, userAnswer, timeTaken }]

    const test = await Test.findById(testId).populate('questions');
    if (!test) {
        res.status(404);
        throw new Error('Test not found');
    }

    let score = 0;
    const gradedAnswers = [];

    for (const ans of answers) {
        const question = test.questions.find(q => q._id.toString() === ans.questionId);
        let isCorrect = false;

        if (question) {
            if (question.type === 'MCQ') {
                // Find correct option
                const correctOption = question.options.find(opt => opt.isCorrect);
                // Compare IDs or Text? Frontend should send Option ID if possible, or Text.
                // Assuming userAnswer is the option _id or text.
                // Let's assume userAnswer is the Option ID string.
                if (correctOption && ans.userAnswer === correctOption._id.toString()) {
                    isCorrect = true;
                    score += 10; // 10 points per MCQ
                }
            } else if (question.type === 'CODING') {
                // Placeholder Logic: If code length > 20, mark correct.
                // In real app, send to Judge0.
                if (ans.userAnswer && ans.userAnswer.length > 20) {
                    isCorrect = true;
                    score += 20; // 20 points per Coding
                }
            }
        }

        gradedAnswers.push({
            questionId: ans.questionId,
            userAnswer: ans.userAnswer,
            isCorrect,
            timeTaken: ans.timeTaken
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
            select: 'topics difficulty' // Populate topics to analyze
        });

    if (!lastAttempt) {
        res.status(404);
        throw new Error('No attempts found');
    }

    // Analyze topics
    const topicStats = {}; // { 'Arrays': { correct: 2, total: 3 } }

    lastAttempt.answers.forEach(ans => {
        const question = ans.questionId;
        if (question && question.topics) {
            question.topics.forEach(topic => {
                if (!topicStats[topic]) {
                    topicStats[topic] = { correct: 0, total: 0 };
                }
                topicStats[topic].total += 1;
                if (ans.isCorrect) {
                    topicStats[topic].correct += 1;
                }
            });
        }
    });

    const weakTopics = [];
    const strongTopics = [];
    const averageTopics = [];

    for (const [topic, stats] of Object.entries(topicStats)) {
        const accuracy = (stats.correct / stats.total) * 100;
        if (accuracy < 60) weakTopics.push(topic);
        else if (accuracy > 80) strongTopics.push(topic);
        else averageTopics.push(topic);
    }

    // Generate Plan Tasks
    // 3-5 questions for weak topics
    const dailyTasks = [];
    if (weakTopics.length > 0) {
        dailyTasks.push({
            day: 1,
            description: `Review concepts for: ${weakTopics.join(', ')}`,
            action: 'READ_DOCS'
        });
        dailyTasks.push({
            day: 2,
            description: `Solve 3 easy problems on ${weakTopics[0]}`,
            action: 'PRACTICE'
        });
    } else {
        dailyTasks.push({
            day: 1,
            description: 'Good job! Maintain your streak with a mix of problems.',
            action: 'PRACTICE'
        });
    }

    res.json({
        attemptId: lastAttempt._id,
        score: lastAttempt.score,
        analysis: {
            weak: weakTopics,
            average: averageTopics,
            strong: strongTopics
        },
        plan: dailyTasks
    });
});

// @desc    Create Custom Test
// @route   POST /api/student/test/custom
// @access  Private/Student
const createCustomTest = asyncHandler(async (req, res) => {
    const { topics, difficulty, questionCount = 10 } = req.body;

    const matchStage = { status: 'published' };
    if (topics && topics.length > 0) {
        matchStage.topics = { $in: topics };
    }
    if (difficulty) {
        matchStage.difficulty = difficulty;
    }

    // Fetch random questions
    const questions = await Question.aggregate([
        { $match: matchStage },
        { $sample: { size: Number(questionCount) } }
    ]);

    if (questions.length === 0) {
        res.status(404);
        throw new Error('No questions found matching criteria');
    }

    const test = await Test.create({
        type: 'CUSTOM',
        duration: questions.length * 2, // 2 mins per question
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

    // Get all user attempts
    const attempts = await UserAttempt.find({ userId }).populate('testId');

    if (attempts.length === 0) {
        return res.json({
            user: req.user,
            level: 'Beginner',
            testsTaken: 0,
            averageScore: 0,
            percentile: 0,
            topicMastery: []
        });
    }

    // Calculate stats
    const testsTaken = attempts.length;
    const totalScore = attempts.reduce((sum, att) => sum + att.score, 0);
    const averageScore = totalScore / testsTaken;

    // Determine level
    let level = 'Beginner';
    if (testsTaken >= 30 && averageScore >= 85) level = 'Expert';
    else if (testsTaken >= 15 && averageScore >= 70) level = 'Advanced';
    else if (testsTaken >= 5 && averageScore >= 50) level = 'Intermediate';

    // Calculate percentile
    const allUserAttempts = await UserAttempt.aggregate([
        { $group: { _id: '$userId', avgScore: { $avg: '$score' } } }
    ]);
    const usersWithLowerScore = allUserAttempts.filter(u => u.avgScore < averageScore).length;
    const percentile = allUserAttempts.length > 0
        ? Math.round((usersWithLowerScore / allUserAttempts.length) * 100)
        : 0;

    // Topic mastery analysis
    const topicStats = {};
    for (const attempt of attempts) {
        const populatedAttempt = await UserAttempt.findById(attempt._id)
            .populate('answers.questionId');

        if (populatedAttempt && populatedAttempt.answers) {
            populatedAttempt.answers.forEach(ans => {
                const question = ans.questionId;
                if (question && question.topics) {
                    question.topics.forEach(topic => {
                        if (!topicStats[topic]) {
                            topicStats[topic] = { correct: 0, total: 0 };
                        }
                        topicStats[topic].total += 1;
                        if (ans.isCorrect) {
                            topicStats[topic].correct += 1;
                        }
                    });
                }
            });
        }
    }

    const topicMastery = Object.entries(topicStats).map(([topic, stats]) => ({
        topic,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        questionsAttempted: stats.total
    })).sort((a, b) => b.accuracy - a.accuracy);

    res.json({
        user: {
            name: req.user.name,
            email: req.user.email,
            collegeId: req.user.collegeId,
            role: req.user.role
        },
        level,
        testsTaken,
        averageScore: Math.round(averageScore),
        percentile,
        topicMastery,
        recentAttempts: attempts.slice(-5).reverse().map(att => ({
            testId: att.testId,
            score: att.score,
            completedAt: att.completedAt
        }))
    });
});

// @desc    Get Available Topics
// @route   GET /api/student/topics
// @access  Private/Student
const getTopics = asyncHandler(async (req, res) => {
    const topics = await Question.distinct('topics', { status: 'published' });
    res.json(topics.filter(t => t)); // Filter out null/undefined
});

module.exports = {
    generateDiagnosticTest,
    submitTest,
    getImprovementPlan,
    createCustomTest,
    getTestById,
    getUserProfile,
    getTopics
};
