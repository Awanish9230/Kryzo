const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

const { errorHandler } = require('./middleware/errorMiddleware');

// Basic Route
app.get('/', (req, res) => {
    res.send('Kryzo API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/compiler', require('./routes/compilerRoutes'));



// Error Handling Middleware
app.use(errorHandler);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route to serve the React app
app.get('/:path*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

