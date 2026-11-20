import { createContext, useContext, useState } from 'react';
import { api, EP } from './api.js';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored && stored !== 'undefined' ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const save = (d) => {
    const u = d.user || d.data?.user || d.data;
    const token = d.token || d.data?.token;
    if (token) localStorage.setItem('token', token);
    if (u) localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };
  const login = async (body) => save(await api(EP.login, { method: 'POST', body }));
  const register = async (body) => save(await api(EP.register, { method: 'POST', body }));
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };
  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}