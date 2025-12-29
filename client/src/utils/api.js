import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api` : '/api',
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
