import type { Response } from 'express';
import type { IUser } from '../models/User.js';
export declare const signSessionToken: (user: IUser) => string;
export declare const setSessionCookie: (res: Response, user: IUser) => void;
export declare const clearSessionCookie: (res: Response) => void;
//# sourceMappingURL=authTokenService.d.ts.map