const mongoose = require('mongoose');

const userAttemptSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        userAnswer: {
            type: mongoose.Schema.Types.Mixed // String (code) or Option ID/Text
        },
        isCorrect: {
            type: Boolean
        },
        timeTaken: {
            type: Number // in seconds
        },
        topic: {
            type: String
        },
        type: {
            type: String
        },
        difficulty: {
            type: String
        }
    }],
    score: {
        type: Number,
        default: 0
    },
    totalTime: {
        type: Number,
        default: 0
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserAttempt', userAttemptSchema);
