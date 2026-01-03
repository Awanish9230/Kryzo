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
            const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
            let cleanUrl;

            if (backendUrl) {
                cleanUrl = backendUrl.replace('/api', '').replace(/\/$/, '');
            } else {
                // Dynamic fallback
                const protocol = window.location.protocol;
                const hostname = window.location.hostname;
                const port = window.location.port;

                // If on Vite dev port, assume backend is at :5000
                if (port === '5173' || port === '5174') {
                    cleanUrl = `${protocol}//${hostname}:5000`;
                } else {
                    // In production (Render/etc), use the current origin
                    cleanUrl = window.location.origin;
                }
            }

            const newSocket = io(cleanUrl, {
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5
            });

            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Global Socket: Connected!', newSocket.id);
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
