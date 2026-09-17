import { AUTH_ROUTES } from '../constants/auth';
import type {
  AuthResult,
  PasswordChangeData,
  RegisterUserData,
  User,
  UserRole,
} from '../types/user';
import { apiRequest } from './apiClient';
import { STORAGE_KEYS, storageService } from './storageService';

interface ApiResponse extends AuthResult {
  users?: User[];
}

const request = async (
  path: string,
  body?: unknown,
  method = 'POST',
): Promise<AuthResult> => {
  try {
    const { response, data } = await apiRequest<ApiResponse>(path, {
      method,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return response.ok && data.success
      ? data
      : { success: false, error: data.error || 'Request failed' };
  } catch {
    return { success: false, error: 'Could not connect to the server.' };
  }
};

export const authService = {
  getCurrentUser: (): User | null =>
    storageService.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null),

  setCurrentUser(user: User): void {
    storageService.setItem(STORAGE_KEYS.CURRENT_USER, user);
  },

  clearCurrentUser(): void {
    storageService.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  async login(identifier: string, password: string): Promise<AuthResult> {
    const result = await request(AUTH_ROUTES.login, { identifier, password });
    if (result.user) this.setCurrentUser(result.user);
    return result;
  },

  async register(data: RegisterUserData): Promise<AuthResult> {
    const result = await request(AUTH_ROUTES.register, data);
    if (result.user) this.setCurrentUser(result.user);
    return result;
  },

  async googleSignIn(credential: string): Promise<AuthResult> {
    const result = await request(AUTH_ROUTES.google, { credential });
    if (result.user) this.setCurrentUser(result.user);
    return result;
  },

  forgotPassword: (email: string): Promise<AuthResult> =>
    request(AUTH_ROUTES.forgotPassword, { email }),

  resetPassword: (token: string, password: string): Promise<AuthResult> =>
    request(AUTH_ROUTES.resetPassword, { token, password }),

  changePassword: (data: PasswordChangeData): Promise<AuthResult> =>
    request(AUTH_ROUTES.changePassword, data, 'PUT'),

  async fetchMe(): Promise<User | null> {
    try {
      const { response, data } = await apiRequest<ApiResponse>(AUTH_ROUTES.me);
      if (response.ok && data.user) {
        this.setCurrentUser(data.user);
        return data.user;
      }
    } catch {
      this.clearCurrentUser();
      return null;
    }
    this.clearCurrentUser();
    return null;
  },

  async getUsers(): Promise<User[]> {
    try {
      const { response, data } = await apiRequest<ApiResponse>('/auth/users');
      if (response.ok && data.users) return data.users;
    } catch {
      return [];
    }
    return [];
  },

  async logout(): Promise<void> {
    await request(AUTH_ROUTES.logout);
    this.clearCurrentUser();
  },

  async updateProfile(data: Partial<User>): Promise<AuthResult> {
    const user = this.getCurrentUser();
    if (!user) return { success: false, error: 'User not logged in' };
    const updated = { ...user, ...data };
    this.setCurrentUser(updated);
    return { success: true, user: updated };
  },

  updateUserRole: (userId: string, role: UserRole): Promise<AuthResult> =>
    request(`/auth/users/${userId}/role`, { role }, 'PUT'),

  updateUserPermissions: (userId: string, permissions: string[]): Promise<AuthResult> =>
    request(`/auth/users/${userId}/permissions`, { permissions }, 'PUT'),

  createAdmin: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    permissions?: string[];
  }): Promise<AuthResult> => request('/auth/admins', data),

  async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    return request(`/auth/users/${userId}`, undefined, 'DELETE');
  },
};
