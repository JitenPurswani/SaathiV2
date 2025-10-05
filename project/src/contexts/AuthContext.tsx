import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../lib/storage';

interface User {
  id: string;
  name: string;
  language: 'en' | 'hi';
}

interface AuthContextType {
  user: User | null;
  login: (name: string, language: 'en' | 'hi') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = storage.getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = (name: string, language: 'en' | 'hi') => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      language,
    };
    setUser(newUser);
    storage.saveUser(newUser);
  };

  const logout = () => {
    setUser(null);
    storage.clearAll();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
