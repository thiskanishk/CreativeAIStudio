import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email: string;
  subscriptionTier: string;
  planDetails?: {
    creditsRemaining: number;
    planStart: string;
    planEnd: string;
  };
  profilePicture?: string;
}

interface JwtPayload {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // API URL from environment - memoize to prevent recreation
  const API_URL = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api', []);
  
  // Memoize refreshUserData to prevent recreation on each render
  const refreshUserData = useCallback(async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [API_URL]);
  
  // Initialize auth state from local storage
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Check if token is expired
          const decoded = jwt_decode<JwtPayload>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token is expired, log out
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (isMounted) setUser(null);
          } else {
            // Token is valid, set user
            const userJson = localStorage.getItem('user');
            if (userJson && isMounted) {
              const userData = JSON.parse(userJson);
              setUser(userData);
              
              // Optionally, refresh user data in background
              refreshUserData(token);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, [refreshUserData]);
  
  // Register new user
  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [API_URL, router]);
  
  // Login user
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [API_URL, router]);
  
  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  }, [router]);
  
  // Check if user is authenticated
  const checkAuth = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const decoded = jwt_decode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Memoize the context value to prevent unnecessary re-renders of consuming components
  const contextValue = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    error,
    clearError
  }), [user, loading, login, register, logout, checkAuth, error, clearError]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthContext; 