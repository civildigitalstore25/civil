export declare const AUTH: {
    readonly cookieName: 'civil_session';
    readonly jwtExpiresIn: '7d';
    readonly cookieMaxAgeMs: number;
    readonly passwordMinLength: 8;
    readonly resetTokenBytes: 32;
    readonly resetTokenTtlMs: number;
    readonly resetRoute: '/reset-password';
    readonly brevoEndpoint: 'https://api.brevo.com/v3/smtp/email';
    readonly emailPattern: RegExp;
    readonly phonePattern: RegExp;
};
//# sourceMappingURL=auth.d.ts.map