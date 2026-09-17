# Civil Digital Store — Ecommerce Implementation Roadmap

## Product goal

Build a production-ready marketplace for civil-engineering digital products.
Customers discover products, purchase securely, and receive controlled digital
downloads. Administrators manage catalog, orders, customers, and reporting.

## Engineering standards

- Keep secrets only in ignored `.env.local` files; commit `.env.example`.
- Keep UI, domain logic, API access, constants, and types in separate modules.
- Reuse shared components and services before adding feature-specific copies.
- Validate all untrusted data on the server, regardless of client validation.
- Use least-privilege authorization and never trust a role sent by the client.
- Store authentication in secure HTTP-only cookies, not browser token storage.
- Add rate limits, safe error responses, audit logs, and automated tests.
- Keep pages mobile-first, accessible, and usable with keyboard navigation.
- Centralize routes, assets, visual tokens, API paths, and product copy.
- Add localization before launch if more than one language is required.
- Every phase ends with tests, documentation, security checks, and manual QA.

## Phase 1 — Authentication

Status: implemented, pending provider credentials and end-to-end QA.

- Email/phone registration and login.
- Google identity sign-in with server-side ID-token verification.
- Forgot-password email through Brevo.
- Single-use, hashed, expiring reset tokens.
- Authenticated password change with current-password verification.
- HTTP-only session cookie, logout, protected routes, and role checks.
- Authentication endpoint rate limiting and security headers.
- Environment templates and ignored local environment files.

Before production:

- Configure Google OAuth origins and use the same client ID on both apps.
- Verify the Brevo sender/domain and configure the API key.
- Replace all placeholder secrets and rotate credentials previously committed.
- Add email verification and optional MFA for privileged users.
- Add integration tests for every success, denial, expiry, and replay case.

## Phase 2 — Foundation and quality

1. Add shared route, API, copy, asset, color, spacing, and typography constants.
2. Add runtime request validation and a consistent API error format.
3. Add centralized logging, request IDs, error monitoring, and audit events.
4. Add unit, API integration, component, and end-to-end test infrastructure.
5. Add CI for type-check, lint, tests, build, dependency audit, and secret scan.
6. Replace mock/local-storage domain data with database-backed APIs.
7. Define staging and production deployment, backup, and rollback procedures.

## Phase 3 — Customer accounts

1. Persist profile updates and validated addresses.
2. Add email verification, account deletion, and data export.
3. Add saved billing details without storing raw payment-card data.
4. Add notification preferences and marketing consent history.
5. Add session/device management and revoke-all-sessions.
6. Add wishlist and recently viewed products.

## Phase 4 — Catalog

1. Finalize product, category, collection, tag, and variant schemas.
2. Add product lifecycle: draft, scheduled, active, archived.
3. Add media upload, optimization, ordering, alt text, and deletion.
4. Add digital-file versioning and private object-storage delivery.
5. Add pricing, tax category, SKU, license type, and download limits.
6. Add search, filters, sort, pagination, canonical URLs, and SEO metadata.
7. Add related products, bundles, and product recommendations.
8. Add admin bulk import/export with validation and failure reports.

## Phase 5 — Cart and checkout

1. Persist anonymous and signed-in carts on the server.
2. Merge guest carts safely after login.
3. Recalculate prices, discounts, and availability on the server.
4. Add coupons with date, usage, customer, product, and minimum rules.
5. Add checkout contact, billing, tax, consent, and order-review steps.
6. Add idempotency keys to prevent duplicate checkout submissions.
7. Add abandoned-cart expiry and recovery notifications.

## Phase 6 — Payments

1. Select a payment gateway based on supported countries and settlement needs.
2. Create payment intents/orders only from server-calculated totals.
3. Verify signed webhooks and make webhook processing idempotent.
4. Model pending, authorized, paid, failed, cancelled, and refunded states.
5. Add retry, reconciliation, refund, and dispute workflows.
6. Store gateway references only; never store card credentials.
7. Add sandbox integration and end-to-end payment tests.

## Phase 7 — Orders and digital fulfillment

1. Generate immutable order line snapshots and sequential order references.
2. Create invoices with configured tax and business details.
3. Send order, payment, refund, and download emails through Brevo.
4. Create short-lived signed download URLs after verified payment.
5. Enforce download count, expiry, ownership, and product-version rules.
6. Add customer order history, invoice retrieval, and download activity.
7. Add admin notes, refunds, cancellation, and manual fulfillment controls.

## Phase 8 — Reviews and support

1. Allow verified purchasers to submit one moderated review per product.
2. Add rating summaries, reports, moderation, and abuse controls.
3. Add support tickets linked to customer, order, and product.
4. Add Brevo transactional templates and customer communication history.
5. Add FAQ, policies, refund terms, privacy, and contact pages.

## Phase 9 — Administration

1. Replace broad menu permissions with explicit action-level permissions.
2. Add immutable audit logs for privileged and financial actions.
3. Add dashboards for sales, tax, refunds, downloads, and product performance.
4. Add customer, catalog, promotion, order, refund, and review operations.
5. Require stronger authentication and shorter sessions for administrators.
6. Add safe exports with authorization, expiry, and sensitive-field filtering.

## Phase 10 — Launch readiness

1. Perform accessibility, responsive, browser, localization, and content QA.
2. Perform threat modeling, dependency review, penetration testing, and load tests.
3. Add privacy consent, retention, deletion, tax, invoice, and refund compliance.
4. Configure CDN, caching, image optimization, database indexes, and queues.
5. Add uptime alerts, business metrics, backups, restore drills, and runbooks.
6. Validate analytics events and cookie-consent behavior.
7. Run staging acceptance tests, production smoke tests, and rollback rehearsal.

## Definition of done for each feature

- Acceptance criteria and error states are documented.
- API authorization and server validation are implemented.
- Loading, empty, success, and failure states are accessible.
- Unit/integration tests cover critical logic and regressions.
- No secrets, demo credentials, or production data are committed.
- Type-check, lint, build, tests, and security checks pass.
- Manual desktop and mobile QA is recorded.
- Operational metrics, logs, and recovery steps exist where relevant.
