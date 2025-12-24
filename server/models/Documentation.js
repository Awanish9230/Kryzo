const mongoose = require('mongoose');

const documentationSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        index: true
    },
    subtopic: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String, // Markdown or HTML
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Documentation', documentationSchema);
