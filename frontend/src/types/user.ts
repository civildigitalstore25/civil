export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
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
