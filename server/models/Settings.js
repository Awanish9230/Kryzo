const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    global: {
        mcqPoints: { type: Number, default: 4 },
        codingPoints: { type: Number, default: 20 },
        negativeMarking: { type: Boolean, default: false },
        maintenanceMode: { type: Boolean, default: false },
        copyPasteProtection: { type: Boolean, default: true },
        windowBlurDetection: { type: Boolean, default: true },
        fullScreenEnforcement: { type: Boolean, default: false }
    },
    ai: {
        geminiApiKey: { type: String, default: '' },
        promptTemperature: { type: Number, default: 0.7, min: 0, max: 1 },
        weaknessSensitivity: { type: Number, default: 0.5, min: 0, max: 1 }
    },
    user: {
        registrationOpen: { type: Boolean, default: true },
        allowedDomains: [{ type: String }] // e.g. ["college.edu"]
    },
    branding: {
        logoUrl: { type: String, default: '' },
        faviconUrl: { type: String, default: '' },
        primaryColor: { type: String, default: '#3b82f6' },
        secondaryColor: { type: String, default: '#8b5cf6' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
