const SystemLog = require('../models/SystemLog');

/**
 * Log a system event to DB and broadcast via Socket.io
 * @param {Object} io - Socket.io instance
 * @param {String} type - Event type (AUTH, TEST, BATTLE, ADMIN, ERROR)
 * @param {String} message - Human readable message
 * @param {Object} data - Additional metadata (userId, etc)
 */
const logEvent = async (io, type, message, data = {}) => {
    try {
        const { userId, ...metadata } = data;

        // 1. Save to DB
        const logEntry = await SystemLog.create({
            type,
            message,
            userId: userId || null,
            metadata
        });

        // 2. Populate user info for realtime display if needed
        // For speed, we might just send the basic data first
        // If we really need user name immediately, we might need to fetch it or pass it in data

        // 3. Emit to all listening admins
        // We broadcast to 'admin_room' or just global 'system_log' if we trust the client to filter (or middleware handles it)
        // For V1, simple broadcast. Client side admin check protects the view.
        if (io) {
            io.emit('system_log', logEntry);
        }

    } catch (error) {
        console.error('Logging Error:', error);
        // Don't crash the app if logging fails
    }
};

module.exports = { logEvent };
