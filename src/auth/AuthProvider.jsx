import { createContext, useContext, useState, useEffect } from 'react';
import { api, setAccessToken, requestRefreshToken } from '../api/client';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = async () => {
    try {
      // First try to refresh token (deduplicated across concurrent renders)
      await requestRefreshToken();
      
      // Then fetch user profile
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();

    const handleExpired = () => {
      setUser(null);
      navigate('/login');
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const migrateLocalData = async () => {
    try {
      const localTransactions = JSON.parse(localStorage.getItem('spendwise-data') || '[]');
      const localBudgets = JSON.parse(localStorage.getItem('spendwise-budgets') || '[]');
      if (localTransactions.length > 0 || localBudgets.length > 0) {
        await api.post('/backup/import', {
          transactions: localTransactions,
          budgets: localBudgets
        });
        localStorage.removeItem('spendwise-data');
        localStorage.removeItem('spendwise-budgets');
      }
    } catch (err) {
      console.error("Migration failed", err);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.access_token);
    await migrateLocalData();
    const userRes = await api.get('/auth/me');
    setUser(userRes.data);
  };

  const register = async (name, email, password) => {
    await api.post('/auth/register', { name, email, password });
    await login(email, password);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore errors on logout
    } finally {
      setAccessToken(null);
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
