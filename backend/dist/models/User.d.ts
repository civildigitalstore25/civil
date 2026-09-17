import mongoose, { Document } from 'mongoose';
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
export declare const User: mongoose.Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map