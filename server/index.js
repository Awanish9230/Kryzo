const express = require('express');
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
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
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



const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
        credentials: true
    }
});

// Track online users
const onlineUsers = new Map(); // socketId -> userId

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('user_connected', (userId) => {
        if (userId) {
            onlineUsers.set(socket.id, userId);
            // Broadcast online users count/list to admins
            // For checking live online status, we can store userId -> Set(socketIds) map for better O(1) checks
            io.emit('online_users_update', Array.from(new Set(onlineUsers.values())));
        }
    });

    socket.on('disconnect', () => {
        if (onlineUsers.has(socket.id)) {
            onlineUsers.delete(socket.id);
            io.emit('online_users_update', Array.from(new Set(onlineUsers.values())));
        }
        console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible in routes if needed
app.set('io', io);

// Error Handling Middleware
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

