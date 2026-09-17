import type { IUser } from '../models/User.js';
export declare const formatUserResponse: (user: IUser) => {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: import("../models/User.js").UserRole;
    permissions: string[];
    createdAt: Date;
};
//# sourceMappingURL=userPresenter.d.ts.map