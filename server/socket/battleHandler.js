const Question = require('../models/Question');
const { v4: uuidv4 } = require('uuid');

// In-memory state
const waitingQueue = []; // Array of { socketId, userId, rating }
const activeRooms = new Map(); // roomId -> { p1, p2, question, startTime, scores }

module.exports = (io) => {
    const battleNamespace = io.of('/battle');

    battleNamespace.on('connection', (socket) => {
        console.log('User connected to battle namespace:', socket.id);

        // Join Queue
        socket.on('join_queue', async (userData) => {
            const { userId, rating = 1000 } = userData;

            // Check if already in queue
            const existingIndex = waitingQueue.findIndex(u => u.socketId === socket.id);
            if (existingIndex !== -1) return;

            // Simple matchmaking: First come, first served (for now)
            if (waitingQueue.length > 0) {
                // Formatting match
                const opponent = waitingQueue.shift();
                const roomId = uuidv4();

                // Fetch random coding question
                // Try to get a medium question first, fallback to easy
                const questions = await Question.aggregate([
                    { $match: { type: 'CODING', status: 'published' } },
                    { $sample: { size: 1 } }
                ]);

                if (questions.length === 0) {
                    socket.emit('error', { message: 'No coding questions available for battle.' });
                    // Put opponent back in queue or handle error? 
                    // For now, put opponent back at front
                    waitingQueue.unshift(opponent);
                    return;
                }

                const question = questions[0];

                // Create Room
                const roomData = {
                    id: roomId,
                    p1: { socketId: opponent.socketId, userId: opponent.userId, progress: 0 },
                    p2: { socketId: socket.id, userId: userId, progress: 0 },
                    question,
                    startTime: Date.now(),
                    status: 'active'
                };

                activeRooms.set(roomId, roomData);

                // Notify players
                battleNamespace.to(opponent.socketId).emit('match_found', {
                    roomId,
                    opponentId: userId,
                    question
                });
                socket.emit('match_found', {
                    roomId,
                    opponentId: opponent.userId,
                    question
                });

                // Join socket rooms
                // Note: 'socket.join' works on the socket instance itself, but we need to ensure we are using the namespace objects correctly if needed. 
                // Actually, we can just emit specific messages to socket IDs or use socket.join(roomId).
                // For namespace sockets, we need to get the socket object for the opponent. 
                // Since we don't have the opponent's socket instance right here easily without lookups, direct emitting to socketId is safer for this prototype.

                // Alternative: explicit join
                const opponentSocket = battleNamespace.sockets.get(opponent.socketId);
                if (opponentSocket) opponentSocket.join(roomId);
                socket.join(roomId);

            } else {
                // Add to queue
                waitingQueue.push({ socketId: socket.id, userId, rating });
                socket.emit('queue_joined', { message: 'Looking for opponent...' });
            }
        });

        // Leave Queue
        socket.on('leave_queue', () => {
            const index = waitingQueue.findIndex(u => u.socketId === socket.id);
            if (index !== -1) {
                waitingQueue.splice(index, 1);
                socket.emit('queue_left');
            }
        });

        // Progress Update (e.g., passing test cases)
        socket.on('update_progress', ({ roomId, progress }) => {
            // progress is number of test cases passed or percentage
            const room = activeRooms.get(roomId);
            if (!room) return;

            // Relat to opponent
            socket.to(roomId).emit('opponent_progress', { progress });

            // Update internal state
            if (room.p1.socketId === socket.id) room.p1.progress = progress;
            else if (room.p2.socketId === socket.id) room.p2.progress = progress;

            // Win Condition Check
            // Assuming progress 100 means all cases passed
            if (progress === 100) {
                const winnerId = room.p1.socketId === socket.id ? room.p1.userId : room.p2.userId;
                battleNamespace.to(roomId).emit('game_over', { winnerId });
                activeRooms.delete(roomId);
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            // Remove from queue
            const qIndex = waitingQueue.findIndex(u => u.socketId === socket.id);
            if (qIndex !== -1) waitingQueue.splice(qIndex, 1);

            // Handle active game dc?
            // Ideally notify opponent 'opponent disconnected'
            for (const [roomId, room] of activeRooms.entries()) {
                if (room.p1.socketId === socket.id || room.p2.socketId === socket.id) {
                    battleNamespace.to(roomId).emit('opponent_disconnected');
                    activeRooms.delete(roomId);
                }
            }
        });
    });
};
