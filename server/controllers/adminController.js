const asyncHandler = require('express-async-handler');
const Question = require('../models/Question');
const Link = require('../models/User'); // Mistake in original file? Original line was `const User = require('../models/User');` but I see `const Link` in diff? No, I should be careful.
const User = require('../models/User');
const Test = require('../models/Test');
const UserAttempt = require('../models/UserAttempt');
const Documentation = require('../models/Documentation');

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
    const totalQuestions = await Question.countDocuments();
    const publishedQuestions = await Question.countDocuments({ status: 'published' });
    const draftQuestions = await Question.countDocuments({ status: 'draft' });
    const totalTests = await Test.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalAttempts = await UserAttempt.countDocuments();

    res.json({
        totalQuestions,
        publishedQuestions,
        draftQuestions,
        totalTests,
        totalUsers,
        totalAttempts
    });
});

// @desc    Create a new question
// @route   POST /api/admin/questions
// @access  Private/Admin
const createQuestion = asyncHandler(async (req, res) => {
    const {
        type,
        title,
        description,
        difficulty,
        topic,
        subtopic,
        topics,
        expectedTime,
        status,
        options, // MCQ
        constraints, // Coding
        inputFormat,
        outputFormat,
        testCases
    } = req.body;

    // Basic Validation
    if (!type || !title || !description || !difficulty) {
        res.status(400);
        throw new Error('Please fill all required fields');
    }

    // Question Type Validation
    if (type === 'MCQ') {
        if (!options || options.length < 2) {
            res.status(400);
            throw new Error('MCQ must have at least 2 options');
        }
        const correctOptions = options.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
            res.status(400);
            throw new Error('MCQ must have exactly one correct option');
        }
    } else if (type === 'CODING') {
        if (!testCases || testCases.length === 0) {
            res.status(400);
            throw new Error('Coding question must have test cases');
        }
    }

    // Auto-generate question number
    const lastQuestion = await Question.findOne().sort({ questionNumber: -1 });
    const questionNumber = lastQuestion && lastQuestion.questionNumber ? lastQuestion.questionNumber + 1 : 1;

    const question = await Question.create({
        questionNumber,
        type,
        title,
        description,
        difficulty,
        topic,
        subtopic,
        topics,
        expectedTime,
        status: status || 'draft',
        createdBy: req.user.id,
        options: type === 'MCQ' ? options : undefined,
        constraints: type === 'CODING' ? constraints : undefined,
        inputFormat: type === 'CODING' ? inputFormat : undefined,
        outputFormat: type === 'CODING' ? outputFormat : undefined,
        testCases: type === 'CODING' ? testCases : undefined
    });

    res.status(201).json(question);
});

// @desc    Get all questions (with filters)
// @route   GET /api/admin/questions
// @access  Private/Admin
const getQuestions = asyncHandler(async (req, res) => {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;

    // Filters
    const keyword = req.query.keyword ? {
        title: {
            $regex: req.query.keyword,
            $options: 'i',
        },
    } : {};

    const statusFilter = req.query.status ? { status: req.query.status } : {};
    const typeFilter = req.query.type ? { type: req.query.type } : {};

    const count = await Question.countDocuments({ ...keyword, ...statusFilter, ...typeFilter });
    const questions = await Question.find({ ...keyword, ...statusFilter, ...typeFilter })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.json({ questions, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Update a question
// @route   PUT /api/admin/questions/:id
// @access  Private/Admin
const updateQuestion = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (question) {
        // Update logic... simplistically replacing fields or merging
        question.title = req.body.title || question.title;
        question.description = req.body.description || question.description;
        question.difficulty = req.body.difficulty || question.difficulty;
        question.topic = req.body.topic !== undefined ? req.body.topic : question.topic;
        question.subtopic = req.body.subtopic !== undefined ? req.body.subtopic : question.subtopic;
        question.topics = req.body.topics || question.topics;
        question.expectedTime = req.body.expectedTime || question.expectedTime;
        question.status = req.body.status || question.status;

        if (question.type === 'MCQ') {
            question.options = req.body.options || question.options;
        } else if (question.type === 'CODING') {
            question.testCases = req.body.testCases || question.testCases;
            question.constraints = req.body.constraints || question.constraints;
            question.inputFormat = req.body.inputFormat || question.inputFormat;
            question.outputFormat = req.body.outputFormat || question.outputFormat;
        }

        const updatedQuestion = await question.save();
        res.json(updatedQuestion);
    } else {
        res.status(404);
        throw new Error('Question not found');
    }
});

// @desc    Delete a question
// @route   DELETE /api/admin/questions/:id
// @access  Private/Admin
const deleteQuestion = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (question) {
        await question.deleteOne();
        res.json({ message: 'Question removed' });
    } else {
        res.status(404);
        throw new Error('Question not found');
    }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const pageSize = 20;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword ? {
        $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { email: { $regex: req.query.keyword, $options: 'i' } },
            { collegeId: { $regex: req.query.keyword, $options: 'i' } }
        ]
    } : {};

    const roleFilter = req.query.role ? { role: req.query.role } : {};

    const count = await User.countDocuments({ ...keyword, ...roleFilter });
    const users = await User.find({ ...keyword, ...roleFilter })
        .select('-password')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    // Get attempt counts for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
        const attemptCount = await UserAttempt.countDocuments({ userId: user._id });
        return {
            ...user.toObject(),
            attemptCount
        };
    }));

    res.json({ users: usersWithStats, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        // Prevent deleting admin users
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete admin users');
        }

        // Delete all user attempts
        await UserAttempt.deleteMany({ userId: user._id });

        // Delete all tests created by user
        await Test.deleteMany({ createdBy: user._id });

        // Delete the user
        await user.deleteOne();

        res.json({ message: 'User and associated data removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        user.collegeId = req.body.collegeId || user.collegeId;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            collegeId: updatedUser.collegeId
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get question by ID
// @route   GET /api/admin/questions/:id
// @access  Private/Admin
const getQuestionById = asyncHandler(async (req, res) => {
    const question = await Question.findById(req.params.id);

    if (question) {
        res.json(question);
    } else {
        res.status(404);
        throw new Error('Question not found');
    }
});

// @desc    Create/Update Documentation
// @route   POST /api/admin/documentation
// @access  Private/Admin
const createDocumentation = asyncHandler(async (req, res) => {
    const { topic, title, content, difficulty } = req.body;

    if (!topic || !title || !content) {
        res.status(400);
        throw new Error('Please fill all fields');
    }

    // Check if doc exists for this topic/difficulty
    let doc = await Documentation.findOne({ topic, difficulty });

    if (doc) {
        doc.title = title;
        doc.content = content;
        await doc.save();
        res.json(doc);
    } else {
        doc = await Documentation.create({
            topic,
            title,
            content,
            difficulty,
            createdBy: req.user.id
        });
        res.status(201).json(doc);
    }
});

// @desc    Get all documentation
// @route   GET /api/admin/documentation
// @access  Private/Admin
const getAllDocumentation = asyncHandler(async (req, res) => {
    const docs = await Documentation.find({}).sort({ topic: 1 });
    res.json(docs);
});

// @desc    Delete documentation
// @route   DELETE /api/admin/documentation/:id
// @access  Private/Admin
const deleteDocumentation = asyncHandler(async (req, res) => {
    const doc = await Documentation.findById(req.params.id);
    if (doc) {
        await doc.deleteOne();
        res.json({ message: 'Documentation removed' });
    } else {
        res.status(404);
        throw new Error('Documentation not found');
    }
});

module.exports = {
    getStats,
    createQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    getAllUsers,
    deleteUser,
    updateUser,
    getQuestionById,
    createDocumentation, // New
    getAllDocumentation, // New
    deleteDocumentation // New
};
