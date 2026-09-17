import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'admin' | 'superadmin';
export type AuthProvider = 'local' | 'google';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  authProvider: AuthProvider;
  googleId?: string;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  passwordChangedAt?: Date;
  tokenVersion: number;
  role: UserRole;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      minlength: 8,
      select: false, // Don't return password by default in queries
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
    },
    passwordChangedAt: Date,
    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },
    permissions: {
      type: [String],
      default: ['dashboard', 'products', 'categories', 'orders', 'users', 'admins', 'profile'],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
export default User;
