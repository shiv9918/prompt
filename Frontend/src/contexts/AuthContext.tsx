import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  joinedAt?: string;
  plan?: string; // 'free', 'pro', 'enterprise', etc.
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const API_URL = "http://localhost:5000"; // Change to your backend URL if needed

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            setUser(data);
      setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("jwt_token");
          }
        })
        .catch(() => {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("jwt_token");
        });
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.access_token) {
      localStorage.setItem("jwt_token", data.access_token);
      setUser(data.user);
    setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, error: data.msg || "Login failed" };
  };

  const signup = async (username: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      // Optionally auto-login after signup
      return login(username, password);
    }
    return { success: false, error: data.msg || "Signup failed" };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("jwt_token");
  };

  const updateProfile = (updates: Partial<User>) => {
    // Implement profile update logic with backend if needed
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      signup,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};