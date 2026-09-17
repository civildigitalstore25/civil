import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js';
export declare const getAllUsers: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUserRole: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUserPermissions: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createAdmin: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=userAdminController.d.ts.map