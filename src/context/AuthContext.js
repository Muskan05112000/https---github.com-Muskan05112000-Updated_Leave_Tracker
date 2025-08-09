import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username, role }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Real login function (calls backend)
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://cts-vibeappso3801-5.azurewebsites.net/api';
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        setError('Invalid Username or password');
        setLoading(false);
        return false;
      }
      const data = await res.json();
      setUser({ associateId: data.associateId, role: data.role });
      setLoading(false);
      return true;
    } catch (err) {
      setError('Network error');
      setLoading(false);
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
