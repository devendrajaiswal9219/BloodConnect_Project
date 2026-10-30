import { createContext, useEffect, useState } from "react";
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("bbms_user");
        return stored ? JSON.parse(stored) : null;
    });

    const [loading, setLoading] = useState(true);

       useEffect(() => {
    const token = localStorage.getItem('bbms_token');

    if (!token) {
        setLoading(false);
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
    const res = await api.get('/auth/login', {
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
                register,logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext)