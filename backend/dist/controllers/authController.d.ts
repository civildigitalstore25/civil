import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
export declare const register: (req: AuthRequest, res: Response) => Promise<void>;
export declare const login: (req: AuthRequest, res: Response) => Promise<void>;
export declare const logout: (_req: AuthRequest, res: Response) => void;
export declare const getMe: (req: AuthRequest, res: Response) => void;
//# sourceMappingURL=authController.d.ts.map