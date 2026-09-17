export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  permissions?: string[];
  createdAt: string;
}

export interface RegisterUserData {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}
