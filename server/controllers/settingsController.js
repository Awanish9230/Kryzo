const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');

// @desc    Get Global Settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne();

    // Initialize with defaults if none exists
    if (!settings) {
        settings = await Settings.create({});
    }

    res.json(settings);
});

// @desc    Update Global Settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne();

    if (!settings) {
        settings = new Settings({});
    }

    // Merge updates
    const { global, ai, user, branding } = req.body;

    if (global) settings.global = { ...settings.global, ...global };
    if (ai) settings.ai = { ...settings.ai, ...ai };
    if (user) settings.user = { ...settings.user, ...user };
    if (branding) settings.branding = { ...settings.branding, ...branding };

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
});

module.exports = {
    getSettings,
    updateSettings
};
