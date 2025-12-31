const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const trackActivity = asyncHandler(async (req, res, next) => {
    if (req.user) {
        // Update updated every 5 minutes to reduce database writes
        const fiveMinutes = 5 * 60 * 1000;
        const now = new Date();

        // If lastActive is undefined or older than 5 minutes, update it
        if (!req.user.lastActive || (now - new Date(req.user.lastActive) > fiveMinutes)) {
            await User.findByIdAndUpdate(req.user._id, { lastActive: now });
        }
    }
    next();
});

module.exports = { trackActivity };
