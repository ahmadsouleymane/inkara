import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chargement initial — vérifie si un token existe
  useEffect(() => {
    const token = localStorage.getItem('smartlib_token');
    if (token) {
      authApi.getMe()
        .then((u) => {
          setUser(u);
          if (u.organizationId && typeof u.organizationId === 'object') {
            setOrganization(u.organizationId);
          }
        })
        .catch(() => {
          localStorage.removeItem('smartlib_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('smartlib_token', data.token);
    setUser(data.user);
    if (data.organization) setOrganization(data.organization);
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    localStorage.setItem('smartlib_token', data.token);
    setUser(data.user);
    if (data.organization) setOrganization(data.organization);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('smartlib_token');
    setUser(null);
    setOrganization(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const updateOrganization = (updatedOrg) => {
    setOrganization(updatedOrg);
  };

  return (
    <AuthContext.Provider value={{ user, organization, loading, login, register, logout, updateUser, updateOrganization }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
};
