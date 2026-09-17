interface PasswordResetEmail {
    recipientEmail: string;
    recipientName: string;
    resetUrl: string;
}
export declare const sendPasswordResetEmail: ({ recipientEmail, recipientName, resetUrl, }: PasswordResetEmail) => Promise<void>;
export {};
//# sourceMappingURL=emailService.d.ts.map