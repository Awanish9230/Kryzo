const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['DIAGNOSTIC', 'WEEKLY', 'CUSTOM'],
        required: true
    },
    title: {
        type: String,
        required: false // Optional, can be auto-generated
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // System generated might not have a user, or will be admin
    },
    dayNumber: {
        type: Number,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Test', testSchema);
