import { STORAGE_KEYS, storageService } from './storageService';
import type { User, RegisterUserData, UserRole } from '../types/user';

const API_BASE_URL = 'http://localhost:5000/api/auth';
const TOKEN_KEY = 'civil_auth_token';

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getCurrentUser(): User | null {
    return storageService.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user: User): void {
    storageService.setItem<User>(STORAGE_KEYS.CURRENT_USER, user);
  },

  clearCurrentUser(): void {
    storageService.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.removeToken();
  },

  async login(identifier: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid email/phone or password.' };
      }

      if (data.token) {
        this.setToken(data.token);
      }
      if (data.user) {
        this.setCurrentUser(data.user);
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.warn('Backend API connection failed, checking offline storage...', error);
      // Fallback to local storage auth if offline
      const users = storageService.getItem<User[]>(STORAGE_KEYS.USERS, []);
      const cleanId = identifier.trim().toLowerCase();
      const localUser = users.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
      );

      if (localUser && localUser.password === password) {
        this.setCurrentUser(localUser);
        return { success: true, user: localUser };
      }

      return { success: false, error: 'Could not connect to authentication server. Please check backend.' };
    }
  },

  async register(data: RegisterUserData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          mobileNumber: data.mobileNumber,
          password: data.password,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        return { success: false, error: resData.error || 'Registration failed.' };
      }

      if (resData.token) {
        this.setToken(resData.token);
      }
      if (resData.user) {
        this.setCurrentUser(resData.user);
      }

      return { success: true, user: resData.user };
    } catch (error) {
      return { success: false, error: 'Could not connect to authentication server.' };
    }
  },

  async fetchMe(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return this.getCurrentUser();

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.clearCurrentUser();
        return null;
      }

      const data = await response.json();
      if (data.success && data.user) {
        this.setCurrentUser(data.user);
        return data.user;
      }
      return null;
    } catch (error) {
      return this.getCurrentUser();
    }
  },

  async getUsers(): Promise<User[]> {
    const token = this.getToken();
    if (!token) return storageService.getItem<User[]>(STORAGE_KEYS.USERS, []);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success && Array.isArray(data.users)) {
        storageService.setItem<User[]>(STORAGE_KEYS.USERS, data.users);
        return data.users;
      }
    } catch (error) {
      console.warn('Failed to fetch users from backend, using cached list:', error);
    }

    return storageService.getItem<User[]>(STORAGE_KEYS.USERS, []);
  },

  logout(): void {
    this.clearCurrentUser();
  },

  async updateProfile(data: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = this.getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };
    const updated = { ...user, ...data };
    this.setCurrentUser(updated);
    return { success: true, user: updated };
  },

  async updateUserRole(userId: string, role: UserRole): Promise<{ success: boolean; user?: User; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Unauthorized' };

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update user role' };
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: 'Network error while updating role' };
    }
  },

  async updateUserPermissions(userId: string, permissions: string[]): Promise<{ success: boolean; user?: User; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Unauthorized' };

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update user permissions' };
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: 'Network error while updating permissions' };
    }
  },

  async createAdmin(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    permissions?: string[];
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Unauthorized' };

    try {
      const response = await fetch(`${API_BASE_URL}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        return { success: false, error: resData.error || 'Failed to create admin account' };
      }

      return { success: true, user: resData.user };
    } catch (error) {
      return { success: false, error: 'Network error while creating admin account' };
    }
  },

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: 'Unauthorized' };

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to delete user' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error while deleting user' };
    }
  },
};
