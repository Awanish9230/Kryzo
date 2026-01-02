import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]); // Array of user IDs or detailed objects
    const { user } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        // Only connect if user exists and socket doesn't already exist
        if (user?._id && !socketRef.current) {
            // Initialize socket connection
            // Use environment variable for URL if available, else standard logic
            const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            // Strip /api if present for socket connection usually
            const cleanUrl = socketUrl.replace('/api', '');

            const newSocket = io(cleanUrl, {
                transports: ['websocket'], // Force websocket to prevent polling upgrades
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            console.log('Initializing socket connection for user:', user._id);

            socketRef.current = newSocket;
            setSocket(newSocket);

            // Connect event
            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                // Send user_connected event
                newSocket.emit('user_connected', user._id);
            });

            // Listen for online users update
            newSocket.on('online_users_update', (users) => {
                setOnlineUsers(users);
            });

            // Handle reconnection
            newSocket.on('reconnect', () => {
                console.log('Socket reconnected');
                newSocket.emit('user_connected', user._id);
            });

            // Handle disconnect
            newSocket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
            });

            // Handle connection errors
            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }

        // Cleanup function
        return () => {
            if (socketRef.current) {
                console.log('Cleaning up socket connection');
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setOnlineUsers([]);
            }
        };
    }, [user?._id]); // Only depend on user._id, not the entire user object

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
