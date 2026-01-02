const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    collegeId: {
        type: String,
        required: false
    },
    college: {
        type: String,
        required: false
    },
    passingYear: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    profileImage: {
        type: String,
        default: ''
    },
    level: {
        type: String,
        default: 'Beginner'
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastActivityDate: {
        type: String, // Store as YYYY-MM-DD
        default: ''
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    // DSA Progression Tracking
    dsaProgressionLevel: {
        type: Number,
        default: 0, // 8 Levels (0-7): 0-3 (3 topics each), 4-7 (2 topics each)
        min: 0,
        max: 7
    },
    completedDSATopics: {
        type: [String],
        default: []
    },
    currentPlanTopics: {
        type: [String],
        default: []
    },
    currentPlanData: {
        type: Array, // Stores the full 7-day structure
        default: []
    },
    currentPlanGeneratedAt: {
        type: Date
    },
    solvedQuestions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
