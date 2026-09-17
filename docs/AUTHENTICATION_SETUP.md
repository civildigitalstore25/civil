# Authentication setup

## Local configuration

Copy the committed templates to ignored local files:

```powershell
Copy-Item backend/.env.example backend/.env.local
Copy-Item frontend/.env.example frontend/.env.local
```

Replace every placeholder. Generate `JWT_SECRET` with a cryptographically secure
random value of at least 32 characters. The frontend and backend Google client
IDs must match.

## Google sign-in

1. Create a Web OAuth client in Google Cloud Console.
2. Add the local and deployed frontend origins as authorized JavaScript origins.
3. Put the client ID in `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`.
4. Do not create or expose a Google client secret for this ID-token flow.

The frontend receives a Google ID token. The backend verifies its signature,
issuer, audience, expiry, and verified email before creating or linking a user.

## Brevo password-reset email

1. Authenticate the sending domain in Brevo.
2. Create a restricted Brevo API key.
3. Set `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME`.
4. Ensure `FRONTEND_URL` is the public frontend origin in each environment.

Reset tokens are random, stored only as SHA-256 hashes, expire after 30 minutes,
and are removed after use. The forgot-password endpoint returns an explicit
error for unknown email addresses, as required by the current product behavior.
This exposes account-registration status and should be reconsidered before
production.

## Security notes

- Sessions use an HTTP-only, SameSite cookie and are never exposed to JavaScript.
- Production cookies are marked Secure.
- CORS accepts only `FRONTEND_URL` and allows credentials.
- Authentication endpoints are rate-limited.
- Changing a password invalidates older session tokens.
- Rotate the previously tracked JWT and superadmin credentials before reuse.
- Never commit `.env.local`; update only `.env.example` when variables change.

## Manual QA

1. Register, refresh, sign out, and sign in by email and phone.
2. Sign in with a new Google user and an existing matching-email user.
3. Request a reset for existing and unknown email addresses.
4. Use a valid reset link, retry it, and test an expired or modified link.
5. Change a password with incorrect and correct current passwords.
6. Confirm old sessions fail after a password change.
7. Confirm user/admin route access remains correctly restricted.
