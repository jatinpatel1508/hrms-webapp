import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User } from '../services/authService';
import { websocketService } from '../services/websocketService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // Connect WebSocket if authenticated
    if (currentUser) {
      websocketService.connect();
    }
    
    return () => {
      // Disconnect WebSocket on unmount
      websocketService.disconnect();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login({ email, password });
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    // Connect WebSocket after login
    if (currentUser) {
      websocketService.connect();
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    await authService.register({ email, password, firstName, lastName });
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  const logout = () => {
    websocketService.disconnect();
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

