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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
