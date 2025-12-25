import { useEffect, useRef } from 'react';
import api from '../utils/api';

const SessionTracker = () => {
    const timeRef = useRef(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        // Start tracking
        intervalRef.current = setInterval(() => {
            timeRef.current += 60; // 60 seconds
            updateTime(60);
        }, 60000); // Every minute

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const updateTime = async (seconds) => {
        try {
            await api.post('/student/activity/update', { timeSpent: seconds });
        } catch (err) {
            console.error('Failed to update activity time', err);
        }
    };

    return null; // Invisible component
};

export default SessionTracker;
