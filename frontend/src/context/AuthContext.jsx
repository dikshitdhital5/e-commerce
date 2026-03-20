// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('furniture_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Signup function
  const signup = (name, email, password) => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('furniture_users') || '[]');
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return { success: false, message: 'User already exists with this email' };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: btoa(password), // Simple encoding (in real app, use proper encryption)
      createdAt: new Date().toISOString(),
      orders: [],
      wishlist: []
    };

    // Save to users list
    users.push(newUser);
    localStorage.setItem('furniture_users', JSON.stringify(users));

    // Create session
    const userSession = { 
      id: newUser.id, 
      name: newUser.name, 
      email: newUser.email 
    };
    localStorage.setItem('furniture_user', JSON.stringify(userSession));
    setUser(userSession);
    
    return { success: true, message: 'Account created successfully!' };
  };

  // Login function
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('furniture_users') || '[]');
    const encodedPassword = btoa(password);
    
    const foundUser = users.find(u => u.email === email && u.password === encodedPassword);
    
    if (foundUser) {
      const userSession = { 
        id: foundUser.id, 
        name: foundUser.name, 
        email: foundUser.email 
      };
      localStorage.setItem('furniture_user', JSON.stringify(userSession));
      setUser(userSession);
      return { success: true, message: 'Login successful!' };
    }
    
    return { success: false, message: 'Invalid email or password' };
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('furniture_user');
    setUser(null);
    setShowAuthModal(false);
  };

  const value = {
    user,
    loading,
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};