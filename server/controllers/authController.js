const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, collegeId } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check System Settings
    const Settings = require('../models/Settings');
    const settings = await Settings.findOne() || {};

    if (settings.user?.registrationOpen === false) {
        res.status(403);
        throw new Error('Registration is currently closed by administration');
    }

    if (settings.user?.allowedDomains?.length > 0) {
        const domain = email.split('@')[1];
        if (!settings.user.allowedDomains.includes(domain)) {
            res.status(403);
            throw new Error(`Registration restricted to authorized domains: ${settings.user.allowedDomains.join(', ')}`);
        }
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'student', // Always force student role for public registration
        collegeId
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        const expiresIn = rememberMe ? '7d' : '1d';

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, expiresIn),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// Generate JWT
const generateToken = (id, expiresIn = '1d') => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn,
    });
};

module.exports = {
    registerUser,
    loginUser,
};
