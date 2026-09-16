import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, RegisterUserData, UserRole } from '../types/user';
import { authService } from '../services/authService';
import { initializeAppData } from '../utils/seedData';

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  users: User[];
  login: (identifier: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (data: RegisterUserData) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateUserRole: (userId: string, role: UserRole) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateUserPermissions: (userId: string, permissions: string[]) => Promise<{ success: boolean; user?: User; error?: string }>;
  createAdmin: (data: { name: string; email: string; phone: string; password: string; role?: UserRole; permissions?: string[] }) => Promise<{ success: boolean; user?: User; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  refreshUsers: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize App Data and authenticate user session on startup
  useEffect(() => {
    const initAuth = async () => {
      initializeAppData();
      const activeUser = await authService.fetchMe();
      setCurrentUser(activeUser);

      if (activeUser && (activeUser.role === 'admin' || activeUser.role === 'superadmin')) {
        const fetchedUsers = await authService.getUsers();
        setUsers(fetchedUsers);
      }
      setInitialized(true);
    };

    initAuth();
  }, []);

  const refreshUsers = useCallback(async () => {
    const fetchedUsers = await authService.getUsers();
    setUsers(fetchedUsers);
    const me = await authService.fetchMe();
    if (me) {
      setCurrentUser(me);
    }
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const result = await authService.login(identifier, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      if (result.user.role === 'admin' || result.user.role === 'superadmin') {
        const fetchedUsers = await authService.getUsers();
        setUsers(fetchedUsers);
      }
    }
    return result;
  }, []);

  const register = useCallback(async (data: RegisterUserData) => {
    const result = await authService.register(data);
    if (result.success && result.user) {
      setCurrentUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setUsers([]);
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const result = await authService.updateProfile(data);
    if (result.success && result.user) {
      setCurrentUser(result.user);
    }
    return result;
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: UserRole) => {
    const result = await authService.updateUserRole(userId, role);
    if (result.success) {
      await refreshUsers();
    }
    return result;
  }, [refreshUsers]);

  const updateUserPermissions = useCallback(async (userId: string, permissions: string[]) => {
    const result = await authService.updateUserPermissions(userId, permissions);
    if (result.success) {
      await refreshUsers();
    }
    return result;
  }, [refreshUsers]);

  const createAdmin = useCallback(async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    permissions?: string[];
  }) => {
    const result = await authService.createAdmin(data);
    if (result.success) {
      await refreshUsers();
    }
    return result;
  }, [refreshUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    const result = await authService.deleteUser(userId);
    if (result.success) {
      await refreshUsers();
    }
    return result;
  }, [refreshUsers]);

  const isAuthenticated = !!currentUser;
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  const contextValue = useMemo<AuthContextType>(
    () => ({
      currentUser,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      users,
      login,
      register,
      logout,
      updateProfile,
      updateUserRole,
      updateUserPermissions,
      createAdmin,
      deleteUser,
      refreshUsers,
    }),
    [
      currentUser,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      users,
      login,
      register,
      logout,
      updateProfile,
      updateUserRole,
      updateUserPermissions,
      createAdmin,
      deleteUser,
      refreshUsers,
    ]
  );

  if (!initialized) {
    return null;
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
