const asyncHandler = require('express-async-handler');
const Question = require('../models/Question');
const User = require('../models/User');
const Test = require('../models/Test');
const UserAttempt = require('../models/UserAttempt');
const Documentation = require('../models/Documentation');
const ReportedQuestion = require('../models/ReportedQuestion');
const TOPICS_DATA = require('../config/topicsData');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Settings = require('../models/Settings');
const bcrypt = require('bcryptjs');

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

    // Stats by Type
    const typeStats = await Question.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    // Stats by Difficulty
    const difficultyStats = await Question.aggregate([
        { $group: { _id: "$difficulty", count: { $sum: 1 } } }
    ]);

    // Stats by Topic
    // Note: Since we have both 'topic' (string) and 'topics' (array), 
    // we'll prioritize 'topic' but handle 'topics' if 'topic' is missing.
    const topicStats = await Question.aggregate([
        {
            $project: {
                effectiveTopic: {
                    $cond: {
                        if: { $ne: ["$topic", null] },
                        then: "$topic",
                        else: { $arrayElemAt: ["$topics", 0] }
                    }
                }
            }
        },
        { $group: { _id: "$effectiveTopic", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 } // Show top 10 topics
    ]);

    // Gap Analysis
    const allExistingQuestions = await Question.find({ status: 'published' }).select('topic subtopic');
    const gaps = [];
    const targetCount = (await Settings.findOne())?.ai?.targetQuestionsPerTopic || 5;

    for (const [topic, subtopics] of Object.entries(TOPICS_DATA)) {
        for (const sub of subtopics) {
            const count = allExistingQuestions.filter(q =>
                (q.topic === topic && q.subtopic === sub) ||
                (q.topics && q.topics.includes(sub))
            ).length;

            if (count < targetCount) {
                gaps.push({ topic, subtopic: sub, count, needed: targetCount - count });
            }
        }
    }

    res.json({
        totalQuestions,
        publishedQuestions,
        draftQuestions,
        totalTests,
        totalUsers,
        totalAttempts,
        gaps: gaps.sort((a, b) => a.count - b.count).slice(0, 10),
        breakdown: {
            type: typeStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
            difficulty: difficultyStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
            topics: topicStats.map(t => ({ name: t._id || 'Unset', count: t.count }))
        }
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
        $or: [
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { topic: { $regex: req.query.keyword, $options: 'i' } },
            { subtopic: { $regex: req.query.keyword, $options: 'i' } },
            { topics: { $regex: req.query.keyword, $options: 'i' } }
        ]
    } : {};

    const statusFilter = req.query.status ? { status: req.query.status } : {};
    const typeFilter = req.query.type ? { type: req.query.type } : {};
    const difficultyFilter = req.query.difficulty ? { difficulty: req.query.difficulty } : {};

    const filter = { ...keyword, ...statusFilter, ...typeFilter, ...difficultyFilter };

    const count = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
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

// @desc    Create a new user (admin or student)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, collegeId } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide name, email, and password');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // We rely on the User model pre-save hook to hash the password if it exists there, 
    // BUT looking at authController, it hashes manually. Let's check User model or just hash here to be safe/consistent.
    // authController uses: const salt = await bcrypt.genSalt(10); const hashedPassword = await bcrypt.hash(password, salt);
    // I should require bcrypt if not imported, or check if I can just use User.create if model handles it.
    // `authController` line 27 implies manual hashing. I'll do the same to be safe.
    // I need to import bcrypt. It's not imported in adminController.
    // Wait, let me check provided file content for adminController. It does NOT import bcrypt.
    // I will use a separate replacement to add the import first.

    // placeholder implementation relying on subsequent import addition
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'student',
        collegeId
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            collegeId: user.collegeId
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
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

// @desc    Bulk upload questions
// @route   POST /api/admin/questions/bulk
// @access  Private/Admin
const bulkUploadQuestions = asyncHandler(async (req, res) => {
    const questionsData = req.body; // Expecting an array of question objects

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
        res.status(400);
        throw new Error('Please provide an array of questions');
    }

    // Basic validation and formatting
    const lastQuestion = await Question.findOne().sort({ questionNumber: -1 });
    let currentNumber = lastQuestion && lastQuestion.questionNumber ? lastQuestion.questionNumber : 0;

    const formattedQuestions = questionsData.map((q) => {
        currentNumber++;
        return {
            ...q,
            questionNumber: currentNumber,
            createdBy: req.user.id,
            status: q.status || 'draft'
        };
    });

    const questions = await Question.insertMany(formattedQuestions);
    res.status(201).json({ message: `${questions.length} questions uploaded successfully`, count: questions.length });
});

// @desc    Get question stats for current admin

// @route   GET /api/admin/my-stats
// @access  Private/Admin
const getAdminQuestionStats = asyncHandler(async (req, res) => {
    const adminId = req.user._id;

    const totalQuestions = await Question.countDocuments({ createdBy: adminId });

    // Stats by type
    const mcqCount = await Question.countDocuments({ createdBy: adminId, type: 'MCQ' });
    const codingCount = await Question.countDocuments({ createdBy: adminId, type: 'CODING' });
    const devCount = await Question.countDocuments({ createdBy: adminId, type: 'DEVELOPMENT' });

    // Stats by topic
    const topicStats = await Question.aggregate([
        { $match: { createdBy: adminId } },
        { $group: { _id: "$topic", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    res.json({
        totalQuestions,
        typeStats: {
            MCQ: mcqCount,
            CODING: codingCount,
            DEVELOPMENT: devCount
        },
        topicStats: topicStats.map(stat => ({
            topic: stat._id || 'Unknown',
            count: stat.count
        }))
    });
});

// @desc    Get detailed question breakdown matrix
// @route   GET /api/admin/detailed-stats
// @access  Private/Admin
const getDetailedStats = asyncHandler(async (req, res) => {
    const matrix = await Question.aggregate([
        {
            $project: {
                topic: {
                    $cond: {
                        if: { $ne: ["$topic", null] },
                        then: "$topic",
                        else: { $ifNull: [{ $arrayElemAt: ["$topics", 0] }, "Uncategorized"] }
                    }
                },
                type: 1,
                difficulty: 1
            }
        },
        {
            $group: {
                _id: { topic: "$topic", type: "$type", difficulty: "$difficulty" },
                count: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: "$_id.topic",
                stats: {
                    $push: {
                        type: "$_id.type",
                        difficulty: "$_id.difficulty",
                        count: "$count"
                    }
                },
                total: { $sum: "$count" }
            }
        },
        { $sort: { total: -1 } }
    ]);

    res.json(matrix);
});

// @desc    Get all question reports
// @route   GET /api/admin/questions/reports
// @access  Private/Admin
const getQuestionReports = asyncHandler(async (req, res) => {
    const reports = await ReportedQuestion.find({})
        .populate('userId', 'name email')
        .populate('questionId', 'title type difficulty')
        .sort({ createdAt: -1 });
    res.json(reports);
});

// @desc    Update report status
// @route   PUT /api/admin/questions/reports/:id
// @access  Private/Admin
const updateReportStatus = asyncHandler(async (req, res) => {
    const report = await ReportedQuestion.findById(req.params.id);
    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }
    report.status = req.body.status || report.status;
    await report.save();
    res.json(report);
});

// @desc    Get analytics for questions where students struggle
// @route   GET /api/admin/analytics/pain-points
// @access  Private/Admin
const getPainPointAnalytics = asyncHandler(async (req, res) => {
    const attempts = await UserAttempt.find({});
    const questionStats = {};

    attempts.forEach(attempt => {
        attempt.answers.forEach(answer => {
            if (!questionStats[answer.questionId]) {
                questionStats[answer.questionId] = {
                    total: 0,
                    correct: 0,
                    topic: answer.topic,
                    type: answer.type
                };
            }
            questionStats[answer.questionId].total++;
            if (answer.isCorrect) {
                questionStats[answer.questionId].correct++;
            }
        });
    });

    const painPoints = [];
    for (const [qId, stats] of Object.entries(questionStats)) {
        const failureRate = (stats.total - stats.correct) / stats.total;
        if (stats.total >= 3 && failureRate > 0.4) { // Only count if at least 3 students tried and >40% failure
            const question = await Question.findById(qId).select('title questionNumber');
            painPoints.push({
                questionId: qId,
                title: question?.title || 'Unknown',
                questionNumber: question?.questionNumber,
                topic: stats.topic,
                type: stats.type,
                failureRate: Math.round(failureRate * 100),
                totalAttempts: stats.total
            });
        }
    }

    res.json(painPoints.sort((a, b) => b.failureRate - a.failureRate));
});

// @desc    Generate a single question using AI
// @route   POST /api/admin/questions/generate-ai
// @access  Private/Admin
// Helper to get Gemini Model with Key Rotation
const getGenAIModel = async () => {
    const settings = await Settings.findOne();
    let apiKeys = [];

    // Prioritize Settings keys, then env keys
    if (settings?.ai?.geminiApiKey) {
        apiKeys.push(settings.ai.geminiApiKey);
    }

    // Parse env keys (comma separated)
    if (process.env.GEMINI_API_KEYS) {
        const envKeys = process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(k => k);
        apiKeys = [...apiKeys, ...envKeys];
    } else if (process.env.GEMINI_API_KEYS) {
        // Fallback to single key if legacy var is used
        apiKeys.push(process.env.GEMINI_API_KEY);
    }

    // Remove duplicates and filter empty
    apiKeys = [...new Set(apiKeys)].filter(k => k);

    if (apiKeys.length === 0) {
        throw new Error('No Gemini API Keys found. Please configure settings or .env');
    }

    console.log(`Loaded ${apiKeys.length} Gemini API Keys:`, apiKeys.map(k => `...${k.slice(-4)}`)); // DEBUG LOG

    // Simple rotation strategy: Pick random or round-robin?
    // For now, let's try them in order if we implement retry logic, 
    // but here we just return a model initialized with one.
    // To support automatic switching on 429, we need the logic to be "try this key, if fail, try next".

    return { apiKeys };
};

// Retry wrapper for Generative AI
const generateWithRetry = async (prompt, apiKeys) => {
    let lastError = null;

    for (const apiKey of apiKeys) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const result = await model.generateContent(prompt);
            return result;
        } catch (error) {
            console.error(`Gemini API Error (Key: ...${apiKey.slice(-4)}):`, error.message);
            lastError = error;
            // If it's a quota error (429) or server error (503), continue to next key.
            // Otherwise, maybe it's a prompt issue, but safer to try next just in case.
            continue;
        }
    }
    throw new Error(`All API keys failed. Last error: ${lastError?.message}`);
};

// @desc    Generate questions using AI (Bulk & Multi-Subtopic support)
// @route   POST /api/admin/questions/generate-ai
// @access  Private/Admin
const generateQuestionAI = asyncHandler(async (req, res) => {
    const { type, topic, subtopic, subtopics, difficulty, count = 1 } = req.body;

    // Validate count (1-50)
    const questionCount = Math.min(Math.max(1, parseInt(count) || 1), 50);

    // Determine target subtopics
    // If 'subtopics' array is provided, use it. Otherwise fall back to single 'subtopic'.
    const targetSubtopics = (Array.isArray(subtopics) && subtopics.length > 0) ? subtopics : [subtopic].filter(Boolean);

    if (targetSubtopics.length === 0) {
        res.status(400);
        throw new Error('Please contain at least one subtopic.');
    }

    // Get API Keys
    const { apiKeys } = await getGenAIModel();

    // Get existing question titles for context to avoid duplicates (Global check might be too heavy, so we limit to this topic)
    const existingQuestions = await Question.find({
        topic,
        status: { $in: ['published', 'draft'] }
    }).select('title');
    const existingTitles = new Set(existingQuestions.map(q => q.title.toLowerCase()));

    // Distribution of questions per subtopic
    // Example: 20 questions, 3 subtopics. ~7 each.
    const baseCount = Math.floor(questionCount / targetSubtopics.length);
    const remainder = questionCount % targetSubtopics.length;

    let totalGenerated = [];

    // Process in batches/parallel?
    // For reliability, let's process subtopics sequentially to avoid hitting rate limits too hard simultaneously,
    // although our retry logic handles it. Parallel is faster. 
    // Let's do parallel requests for subtopics.

    const validDifficulties = ['easy', 'medium', 'hard'];

    // Capture errors to report if generation completely fails
    let generationErrors = [];

    const generateForSubtopic = async (sub, numToGen) => {
        if (numToGen <= 0) return [];

        let prompt = "";
        const diff = validDifficulties.includes(difficulty) ? difficulty : 'medium';

        if (type === 'MCQ') {
            prompt = `Generate ${numToGen} UNIQUE high-quality MCQ questions for Subject: "${topic}", Subtopic: "${sub}", Difficulty: ${diff}.
            
STRICTLY RETURN ONLY A JSON ARRAY. No markdown, no "json" label.
Format:
[{
    "title": "Unique Title related to ${sub}",
    "description": "Clear question text",
    "difficulty": "${diff}",
    "type": "MCQ",
    "topic": "${topic}",
    "subtopic": "${sub}",
    "options": [
        {"text": "Option A", "isCorrect": true},
        {"text": "Option B", "isCorrect": false},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
    ],
    "explanation": "Brief explanation"
}]`;
        } else {
            prompt = `Generate ${numToGen} UNIQUE high-quality CODING questions for Subject: "${topic}", Subtopic: "${sub}", Difficulty: ${diff}.
            
STRICTLY RETURN ONLY A JSON ARRAY. No markdown, no "json" label.
Format:
[{
    "title": "Unique Title related to ${sub}",
    "description": "Problem statement with examples",
    "difficulty": "${diff}",
    "type": "CODING",
    "topic": "${topic}",
    "subtopic": "${sub}",
    "constraints": "Time/memory constraints",
    "inputFormat": "Input format description",
    "outputFormat": "Output format description",
    "testCases": [
        {"input": "Sample In 1", "output": "Sample Out 1", "isHidden": false},
        {"input": "Hidden In 1", "output": "Hidden Out 1", "isHidden": true}
    ],
    "explanation": "Approach and logic"
}]`;
        }

        try {
            const result = await generateWithRetry(prompt, apiKeys);
            const response = await result.response;
            let text = response.text();

            // Cleanup
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(text);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (err) {
            console.error(`Failed to generate for ${sub}:`, err.message);
            generationErrors.push(`${sub}: ${err.message}`);
            return [];
        }
    };

    const promises = targetSubtopics.map((sub, idx) => {
        const countForThis = baseCount + (idx < remainder ? 1 : 0);
        return generateForSubtopic(sub, countForThis);
    });

    const results = await Promise.all(promises);

    // Flatten results
    results.forEach(batch => {
        if (batch) totalGenerated.push(...batch);
    });

    // Filter duplicates against existing DB
    const uniqueQuestions = totalGenerated.filter(q =>
        q.title && !existingTitles.has(q.title.toLowerCase())
    );

    if (uniqueQuestions.length === 0) {
        // If we have errors, report them
        if (generationErrors.length > 0) {
            res.status(500);
            throw new Error(`Generation failed. Details: ${generationErrors.join(' | ')}`);
        } else {
            // Case where generation worked but duplicates filtered out, or just empty
            res.status(400);
            throw new Error('No unique questions generated. Try changing the prompt params or subtopics.');
        }
    }

    res.json({
        questions: uniqueQuestions,
        generated: uniqueQuestions.length,
        requested: questionCount
    });
});

// @desc    Autonomous gap-filling
// @route   POST /api/admin/questions/auto-fill
// @access  Private/Admin
const autoFillQuestions = asyncHandler(async (req, res) => {
    const settings = await Settings.findOne();
    const apiKey = settings?.ai?.geminiApiKey || process.env.GEMINI_API_KEY;
    const targetCount = settings?.ai?.targetQuestionsPerTopic || 5;

    if (!apiKey) {
        res.status(400);
        throw new Error('Gemini API Key is missing.');
    }

    // 1. Find Gaps
    const allExistingQuestions = await Question.find({ status: 'published' }).select('topic subtopic');
    const gaps = [];

    for (const [topic, subtopics] of Object.entries(TOPICS_DATA)) {
        for (const sub of subtopics) {
            const count = allExistingQuestions.filter(q =>
                (q.topic === topic && q.subtopic === sub) ||
                (q.topics && q.topics.includes(sub))
            ).length;

            if (count < targetCount) {
                gaps.push({ topic, subtopic: sub, count });
            }
        }
    }

    if (gaps.length === 0) {
        return res.json({ message: 'All topics have sufficient coverage!' });
    }

    // Pick top 3 most empty subtopics
    const selectedGaps = gaps.sort((a, b) => a.count - b.count).slice(0, 3);
    const generatedQuestions = [];

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const lastQuestion = await Question.findOne().sort({ questionNumber: -1 });
    let currentNumber = lastQuestion && lastQuestion.questionNumber ? lastQuestion.questionNumber : 0;

    for (const gap of selectedGaps) {
        // Generate one MCQ and one CODING for each gap to ensure variety
        const types = ['MCQ', 'CODING'];
        for (const type of types) {
            const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];

            let prompt = `Generate a ${difficulty} difficulty ${type} question for ${gap.topic} -> ${gap.subtopic}. Return ONLY JSON.`;
            if (type === 'MCQ') {
                prompt += ` Structure: {"title":"","description":"","options":[{"text":"","isCorrect":true},...],"explanation":""}`;
            } else {
                prompt += ` Structure: {"title":"","description":"","constraints":"","inputFormat":"","outputFormat":"","testCases":[{"input":"","output":"","isHidden":false},...],"explanation":""}`;
            }

            try {
                const result = await model.generateContent(prompt);
                let text = (await result.response).text();
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const qData = JSON.parse(text);

                currentNumber++;
                const newQ = await Question.create({
                    ...qData,
                    questionNumber: currentNumber,
                    topic: gap.topic,
                    subtopic: gap.subtopic,
                    difficulty,
                    type,
                    status: 'published',
                    createdBy: req.user.id
                });
                generatedQuestions.push(newQ);
            } catch (err) {
                console.error(`Failed to auto-generate for ${gap.subtopic}:`, err.message);
            }
        }
    }

    res.status(201).json({
        message: `Successfully generated ${generatedQuestions.length} questions to fill gaps.`,
        generatedCount: generatedQuestions.length,
        topicsFilled: selectedGaps.map(g => g.subtopic)
    });
});

module.exports = {

    getStats,
    getDetailedStats, // New
    createQuestion,
    getQuestions,
    updateQuestion,
    deleteQuestion,
    getAllUsers,
    deleteUser,
    updateUser,
    createUser, // New
    getQuestionById,
    createDocumentation, // New
    getAllDocumentation, // New
    deleteDocumentation, // New
    getAdminQuestionStats, // New
    bulkUploadQuestions, // New
    getQuestionReports,
    updateReportStatus,
    getPainPointAnalytics,
    generateQuestionAI,
    autoFillQuestions
};
