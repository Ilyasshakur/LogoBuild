import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, insertUserSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Extend insertUserSchema for registration with password confirmation
export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterCredentials = z.infer<typeof registerSchema>;

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

// Create auth store
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'ushopls-auth',
    }
  )
);

// Auth hook
export const useAuth = () => {
  const { user, token, isLoading, isAuthenticated, setUser, setToken, setLoading } = useAuthStore();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  // Login
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      const data = await response.json();
      
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        
        // Set auth header for future requests
        localStorage.setItem('token', data.token);
        
        // Show success message
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.firstName || data.user.username}!`,
        });
        
        // Invalidate queries that might depend on auth state
        queryClient.invalidateQueries();
        
        return data.user;
      }
    } catch (error: any) {
      const message = error.message || 'Failed to login';
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Register
  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      
      // Remove confirmPassword as it's not expected by the API
      const { confirmPassword, ...userData } = credentials;
      
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data = await response.json();
      
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        
        // Set auth header for future requests
        localStorage.setItem('token', data.token);
        
        // Show success message
        toast({
          title: "Registration Successful",
          description: `Welcome to UshopLS, ${data.user.firstName || data.user.username}!`,
        });
        
        return data.user;
      }
    } catch (error: any) {
      const message = error.message || 'Failed to register';
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    
    // Clear all queries
    queryClient.clear();
    
    // Redirect to home
    navigate('/');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };
  
  // Check current auth state
  const checkAuth = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // If auth check fails, clear auth state
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };
  
  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };
};
