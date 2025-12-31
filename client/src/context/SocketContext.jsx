import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]); // Array of user IDs or detailed objects
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            // Initialize socket connection
            // Use environment variable for URL if available, else standard logic
            const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            // Strip /api if present for socket connection usually
            const cleanUrl = socketUrl.replace('/api', '');

            const newSocket = io(cleanUrl, {
                query: { userId: user._id }
            });

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

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
