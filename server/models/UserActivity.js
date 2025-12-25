const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // Store as YYYY-MM-DD
        required: true
    },
    timeSpent: {
        type: Number, // In seconds
        default: 0
    },
    questionsSolved: {
        type: Number,
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness per user per day
userActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('UserActivity', userActivitySchema);
