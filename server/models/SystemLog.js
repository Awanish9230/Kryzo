const mongoose = require('mongoose');

const systemLogSchema = mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['AUTH', 'TEST', 'BATTLE', 'ADMIN', 'SYSTEM', 'ERROR']
    },
    message: {
        type: String,
        required: true
    },
    metadata: {
        type: Object,
        default: {}
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    ip: {
        type: String
    }
}, {
    timestamps: true
});

// Auto-delete logs older than 30 days to keep DB clean
systemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
