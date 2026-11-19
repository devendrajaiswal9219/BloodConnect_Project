import { useEffect, useState } from "react";
import api from '../api/axios';

import { AuthContext } from './auth';

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("bbms_user");
           if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            localStorage.removeItem("bbms_user");
            return null;
        }
    });

     const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('bbms_token')));

       useEffect(() => {
    const token = localStorage.getItem('bbms_token');

    if (!token) {
        return;
    }

    api
        .get('/auth/me')
        .then((res) => {
            setUser(res.data.user);

            localStorage.setItem(
                'bbms_user',
                JSON.stringify(res.data.user)
            );
        })
        .catch(() => {
            localStorage.removeItem('bbms_token');
            localStorage.removeItem('bbms_user');
            setUser(null);
        })
        .finally(() => setLoading(false));
}, []);

const login = async (email, password) => {
    const res = await api.post('/auth/login', {
        email,
        password
    });
    localStorage.setItem('bbms_token', res.data.token);
    localStorage.setItem(
        'bbms_user',
        JSON.stringify(res.data.user)
    );
    setUser(res.data.user);
    return res.data.user;
};

const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    localStorage.setItem('bbms_token', res.data.token);
    localStorage.setItem(
        'bbms_user',
        JSON.stringify(res.data.user)
    );
    setUser(res.data.user);
    return res.data.user;
};

const logout = () => {
    localStorage.removeItem('bbms_token');
    localStorage.removeItem('bbms_user');
    setUser(null);
};
    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
