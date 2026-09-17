export const AUTH = {
    cookieName: 'civil_session',
    jwtExpiresIn: '7d',
    cookieMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
    passwordMinLength: 8,
    resetTokenBytes: 32,
    resetTokenTtlMs: 30 * 60 * 1000,
    resetRoute: '/reset-password',
    brevoEndpoint: 'https://api.brevo.com/v3/smtp/email',
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phonePattern: /^\+?[1-9]\d{6,14}$/,
};
//# sourceMappingURL=auth.js.map