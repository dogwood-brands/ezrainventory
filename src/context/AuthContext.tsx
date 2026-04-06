'use client';

// ===========================================
// EZRA PORTAL - Authentication Context
// ===========================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, AuthState, LoginFormData } from '@/types';
import { demoUser, getUserByEmail } from '@/data/mockClients';
import { getStorageItem, setStorageItem, removeStorageItem, sleep } from '@/lib/utils';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'ezra_auth';
const TOKEN_KEY = 'ezra_token';

interface StoredAuth {
  user: User;
  token: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  // Load auth state from storage on mount
  useEffect(() => {
    const stored = getStorageItem<StoredAuth | null>(STORAGE_KEY, null);
    const token = getStorageItem<string | null>(TOKEN_KEY, null);

    if (stored && token) {
      setState({
        user: stored.user,
        isAuthenticated: true,
        isLoading: false,
        token,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Demo credentials
  const DEMO_CREDENTIALS = {
    username: 'ezradev',
    password: 'dev123',
  };

  /**
   * Login function - uses demo credentials
   */
  const login = useCallback(async (credentials: LoginFormData) => {
    try {
      // Simulate API latency
      await sleep(800);

      // Check if credentials match demo account
      const usernameMatch = credentials.email.toLowerCase() === DEMO_CREDENTIALS.username.toLowerCase();
      const passwordMatch = credentials.password === DEMO_CREDENTIALS.password;
      
      if (!usernameMatch || !passwordMatch) {
        return { success: false, error: 'Invalid credentials. Please check your username and password.' };
      }

      // Get demo user
      const user: User = {
        ...demoUser,
        email: 'dev@meetezra.bot',
      };

      // Generate a mock JWT token
      const token = `mock_jwt_${btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 86400000 }))}`;

      // Store auth state
      const authData: StoredAuth = { user, token };
      setStorageItem(STORAGE_KEY, authData);
      setStorageItem(TOKEN_KEY, token);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        token,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  }, []);

  /**
   * Logout and clear stored auth
   */
  const logout = useCallback(() => {
    removeStorageItem(STORAGE_KEY);
    removeStorageItem(TOKEN_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
    });
  }, []);

  /**
   * Update user data
   */
  const updateUser = useCallback((updates: Partial<User>) => {
    setState((prev) => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...updates };
      const authData: StoredAuth = { user: updatedUser, token: prev.token! };
      setStorageItem(STORAGE_KEY, authData);

      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permission: User['permissions'][number]): boolean {
  const { user } = useAuth();
  return user?.permissions.includes(permission) ?? false;
}

/**
 * Hook to check if user has any of the specified permissions
 */
export function useAnyPermission(permissions: User['permissions'][number][]): boolean {
  const { user } = useAuth();
  return permissions.some((p) => user?.permissions.includes(p)) ?? false;
}

export { AuthContext };
