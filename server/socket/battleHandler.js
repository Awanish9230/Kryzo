const Question = require('../models/Question');
const { v4: uuidv4 } = require('uuid');
const { logEvent } = require('../utils/logger');

// In-memory state
const waitingQueue = []; // Array of { socketId, userId, rating }
const activeRooms = new Map(); // roomId -> { p1, p2, question, startTime, scores }

module.exports = (io) => {
    // We attach battle listeners to EVERY root connection
    io.on('connection', (socket) => {
        // console.log('Battle system attached to socket:', socket.id);

        const updateCount = () => {
            const count = io.engine?.clientsCount || io.sockets.size || 0;
            io.emit('battle_users_count', count);
        };

        // Initial broadcast to everyone
        updateCount();
        // Also send specifically to this connected socket
        socket.emit('battle_users_count', io.engine?.clientsCount || io.sockets.size || 0);

        socket.on('get_users_count', () => {
            updateCount();
        });

        // Join Queue
        socket.on('join_queue', async (userData) => {
            const { userId, userName, rating = 1000 } = userData;
            // console.log('Join queue request from:', userId, userName);

            // Check if already in queue
            const existingIndex = waitingQueue.findIndex(u => u.socketId === socket.id);
            if (existingIndex !== -1) return;

            // Simple matchmaking: First come, first served (for now)
            if (waitingQueue.length > 0) {
                // Formatting match
                const opponent = waitingQueue.shift();
                const roomId = uuidv4();

                const questions = await Question.aggregate([
                    { $match: { type: 'CODING', status: 'published' } },
                    { $sample: { size: 1 } }
                ]);

                if (questions.length === 0) {
                    socket.emit('error', { message: 'No coding questions available for battle.' });
                    waitingQueue.unshift(opponent);
                    return;
                }

                const question = questions[0];

                const roomData = {
                    id: roomId,
                    p1: { socketId: opponent.socketId, userId: opponent.userId, userName: opponent.userName, progress: 0 },
                    p2: { socketId: socket.id, userId: userId, userName: userName, progress: 0 },
                    question,
                    startTime: Date.now(),
                    status: 'active'
                };

                activeRooms.set(roomId, roomData);

                // Notify players
                io.to(opponent.socketId).emit('match_found', {
                    roomId,
                    opponentId: userId,
                    opponentName: userName,
                    myName: opponent.userName,
                    question
                });
                socket.emit('match_found', {
                    roomId,
                    opponentId: opponent.userId,
                    opponentName: opponent.userName,
                    myName: userName,
                    question
                });

                // Get actual socket instances to join room
                const opponentSocket = io.sockets.sockets.get(opponent.socketId);
                if (opponentSocket) opponentSocket.join(roomId);
                socket.join(roomId);

            } else {
                waitingQueue.push({ socketId: socket.id, userId, userName, rating });
                socket.emit('queue_joined', { message: 'Looking for opponent...' });
            }
        });

        socket.on('leave_queue', () => {
            const index = waitingQueue.findIndex(u => u.socketId === socket.id);
            if (index !== -1) {
                waitingQueue.splice(index, 1);
                socket.emit('queue_left');
            }
        });

        socket.on('update_progress', ({ roomId, progress }) => {
            const room = activeRooms.get(roomId);
            if (!room) return;

            socket.to(roomId).emit('opponent_progress', { progress });

            if (room.p1.socketId === socket.id) room.p1.progress = progress;
            else if (room.p2.socketId === socket.id) room.p2.progress = progress;

            if (progress === 100) {
                const winnerId = room.p1.socketId === socket.id ? room.p1.userId : room.p2.userId;
                io.to(roomId).emit('game_over', { winnerId });
                logEvent(io, 'BATTLE', `Battle Finished: Winner ${winnerId}`, { roomId, winnerId });
                activeRooms.delete(roomId);
            }
        });

        socket.on('leave_battle', ({ roomId }) => {
            const room = activeRooms.get(roomId);
            if (!room) return;

            const winnerId = room.p1.socketId === socket.id ? room.p2.userId : room.p1.userId;

            io.to(roomId).emit('game_over', {
                winnerId,
                reason: 'opponent_left'
            });

            activeRooms.delete(roomId);
            // console.log(`User ${socket.id} left battle ${roomId}. Winner: ${winnerId}`);
        });

        socket.on('join_battle_room', ({ roomId }) => {
            const room = activeRooms.get(roomId);
            if (!room) return;

            socket.join(roomId);

            // Sync names and progress back to the rejoining client
            socket.emit('room_sync', {
                p1: { userId: room.p1.userId, userName: room.p1.userName, progress: room.p1.progress },
                p2: { userId: room.p2.userId, userName: room.p2.userName, progress: room.p2.progress },
                question: room.question
            });
        });

        socket.on('disconnect', () => {
            io.emit('battle_users_count', io.sockets.size);

            const qIndex = waitingQueue.findIndex(u => u.socketId === socket.id);
            if (qIndex !== -1) waitingQueue.splice(qIndex, 1);

            for (const [roomId, room] of activeRooms.entries()) {
                if (room.p1.socketId === socket.id || room.p2.socketId === socket.id) {
                    io.to(roomId).emit('opponent_disconnected');
                    activeRooms.delete(roomId);
                }
            }
        });
    });
};
