import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
export declare const forgotPassword: (req: Request, res: Response) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response) => Promise<void>;
export declare const changePassword: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=passwordController.d.ts.map