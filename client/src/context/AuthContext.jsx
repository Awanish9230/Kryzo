import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        try {
            const storedUser = localStorage.getItem('user');

            if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
                const parsed = JSON.parse(storedUser);

                setUser(parsed);
            }
        } catch (err) {
            console.error('Auth initialization failed', err);
            localStorage.removeItem('user');
        }
        setLoading(false);

    }, []);

    const login = async (email, password, rememberMe) => {
        const { data } = await api.post('/auth/login', { email, password, rememberMe });
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const register = async (formData) => {
        const { data } = await api.post('/auth/register', formData);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };


    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
