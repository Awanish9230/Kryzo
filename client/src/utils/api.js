import axios from 'axios';

const getBaseURL = () => {
    if (import.meta.env.VITE_BACKEND_URL) return `${import.meta.env.VITE_BACKEND_URL}/api`;
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // Dynamic fallback for local testing on other devices (e.g. mobile)
    // If accessed via IP (192.168.x.x), use that IP with port 5000
    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;

        // If we're on a Vite dev port, assume backend is on 5000
        if (port === '5173' || port === '5174') {
            return `${protocol}//${hostname}:5000/api`;
        }
    }

    // In production (Render/etc), use the same domain with /api
    return window.location.origin + '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

if (!import.meta.env.VITE_BACKEND_URL && import.meta.env.PROD) {
    console.warn('VITE_BACKEND_URL is not set in production. API calls may fail if not served from the same domain.');
}

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
