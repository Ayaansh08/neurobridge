import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { cognitoAuth } from '../services/authService';
import type { AuthUser, CognitoTokens } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  setAuth: (email: string, tokens: CognitoTokens) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Tokens are held in React state for this browser session only.
  const [user, setUser] = useState<AuthUser | null>(null);

  const setAuth = (email: string, tokens: CognitoTokens) => {
    setUser({ email, tokens });
  };

  const logout = () => {
    cognitoAuth.signOut(user?.email);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setAuth,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
