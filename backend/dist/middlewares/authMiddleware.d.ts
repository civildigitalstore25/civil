import type { Request, Response, NextFunction } from 'express';
import { type IUser, type UserRole } from '../models/User.js';
export interface AuthRequest extends Request {
    user?: IUser;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRoles: (...roles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authMiddleware.d.ts.map