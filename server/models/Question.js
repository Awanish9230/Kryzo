const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionNumber: {
        type: Number,
        unique: true,
        sparse: true // allows null values while maintaining uniqueness for non-null values
    },
    type: {
        type: String,
        enum: ['MCQ', 'CODING', 'DEVELOPMENT'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    topic: {
        type: String,
        required: false
    },
    subtopic: {
        type: String,
        required: false
    },
    topics: [{
        type: String
    }],
    expectedTime: {
        type: Number, // in minutes
        required: false
    },
    status: {
        type: String,
        enum: ['draft', 'review', 'published'],
        default: 'draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // MCQ Specific Fields
    options: [{
        text: { type: String },
        isCorrect: { type: Boolean, default: false }
    }],
    // Coding Specific Fields
    constraints: { type: String },
    inputFormat: { type: String },
    outputFormat: { type: String },
    testCases: [{
        input: { type: String },
        output: { type: String },
        isHidden: { type: Boolean, default: false }
    }],
    // Explanation and Code Snippet Fields (for all question types)
    explanation: {
        type: String,
        required: false
    },
    codeSnippet: {
        type: String,
        required: false
    },
    codeLanguage: {
        type: String,
        enum: ['javascript', 'python', 'java', 'cpp', 'c', 'html', 'css', 'sql', 'typescript', 'go', 'rust'],
        default: 'javascript',
        required: false
    },
    // Development Specific Fields
    projectRequirements: { type: String },
    evaluationCriteria: [{ type: String }],
    submissionGuidelines: { type: String },
    expectedDeliverables: [{ type: String }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
