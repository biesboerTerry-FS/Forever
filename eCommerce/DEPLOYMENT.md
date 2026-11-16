# Deployment, Operations, and Release Checklist

This document complements [`README.md`](./README.md) and captures production-readiness guidance for the Forever storefront, admin, backend, and mobile app.

## 1. Vercel project layout

Deploy as **separate Vercel projects** with the correct root directories:

| Project | Root directory | Framework/runtime | Build | Output |
| --- | --- | --- | --- | --- |
| Storefront | `eCommerce/frontend` | Vite (React) | `npm run build` (builds app + generates `sitemap.xml`/`robots.txt`) | `dist` |
| Admin | `eCommerce/admin` | Vite (React) | `npm run build` | `dist` |
| Backend API | `eCommerce/backend` | Node serverless (`@vercel/node`, entry `server.js`) | per Vercel/`vercel.json` | n/a |

- Set `VITE_*` variables per frontend/admin project and **redeploy** after changes (baked at build time).
- Set backend secrets/runtime vars on the backend project and redeploy.
- Frontend `vercel.json` rewrites SPA routes but excludes static files (e.g. `/sitemap.xml`, `/robots.txt`, assets) so SEO files are served correctly.

## 2. Environment separation (Preview vs Production)

Use different configuration for **Preview** and **Production** to avoid test traffic affecting real users/data:

- **Database:** separate MongoDB database/cluster (or clearly isolated data) per environment.
- **Payments:** use Stripe/Razorpay **test** keys and **test** webhook endpoints/secrets in Preview; production keys/secrets only in Production.
- **URLs/CORS:** set `VITE_BACKEND_URL`, `VITE_SITE_URL` (frontend), `VITE_BACKEND_URL` (admin), `FRONTEND_URL`, and `CORS_ORIGINS` (backend) to the correct environment domains.
- **Email:** prefer test sender/config in Preview; verify domain/sender for Production (`RESEND_API_KEY`, `EMAIL_FROM`).
- **Auth/OAuth:** keep demo OAuth disabled in production (enforced in code when `NODE_ENV=production`); configure Google OAuth client IDs/origins per environment if enabled.
- **Admin credentials/JWT:** use strong, environment-specific `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET`.

## 3. Database, seeding, backup, and rollback

- **Provisioning:** configure `MONGODB_URI` for the target environment. The app uses the `e-commerce` database.
- **Seeding:**
  - `cd eCommerce/backend && npm run seed` — uploads catalog images to Cloudinary and inserts data.
  - `npm run seed:offline` — uses placeholder image URLs (no Cloudinary required).
  - Seed scripts read catalog data from `eCommerce/frontend/src/assets/assets.js` and can **wipe/recreate** products/orders/reviews and upsert demo data (see `backend/scripts/seed.js`). Run intentionally.
- **Before production changes:** take a MongoDB Atlas backup/snapshot or export relevant collections.
- **Rollback plan:**
  - Application rollback: redeploy previous known-good Vercel deployment for affected project(s).
  - Data rollback: restore Atlas snapshot/export to a recovery target and validate before switching traffic.
  - Keep a record of schema/data-affecting changes and seed runs per environment.

## 4. Payments, webhooks, and email

- **Stripe:** set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`; configure webhook endpoint to the deployed backend route; verify signature validation and order fulfillment/idempotency.
- **Razorpay:** set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`; configure webhook endpoint and verify payment capture/fulfillment.
- **Email (Resend):** without `RESEND_API_KEY`, password reset/order emails are logged to server console only. For production, set `RESEND_API_KEY` and a verified `EMAIL_FROM`.
- **Password reset links:** backend uses `FRONTEND_URL` (or request/Vercel-derived origin fallback) for web reset URLs and includes a mobile deep link (`forever://reset-password?token=...`) in reset emails.

## 5. Mobile (Expo) release/push readiness

- **API config:** set `EXPO_PUBLIC_API_URL` to the deployed backend URL (not `localhost` on physical devices).
- **Deep links:** app scheme is `forever` (`forever://reset-password?token=...` supported by navigation config).
- **Push notifications:**
  - Requires a physical device/dev build and proper Expo/EAS configuration. Set `expo.extra.eas.projectId` in `eCommerce/mobile/app.json` (or EAS config) for your project.
  - App registers Expo push tokens when signed in and **unregisters on sign out** via backend endpoints (`POST /api/user/push-token`, `POST /api/user/push-token/remove`).
  - Configure EAS/FCM/APNs credentials as required for your distribution target; test token registration and order-status notification delivery end-to-end.
- **Checkout parity:** mobile supports COD and Stripe browser checkout flow; native Stripe PaymentSheet/Razorpay SDK integration remains a follow-up if needed.

## 6. Security and reliability checks

- **Secrets:** never commit `.env` files or credentials; rotate any exposed keys/passwords immediately. Verify git history does not contain secrets.
- **Auth/admin:** use strong `JWT_SECRET` and admin credentials; admin tokens are role-scoped and short-lived (12h). Demo OAuth is blocked in production.
- **CORS:** set `CORS_ORIGINS` to trusted storefront/admin domains.
- **Webhooks:** require and validate webhook signatures in production.
- **Rate limiting/body limits:** review auth, forgot-password, newsletter, and upload limits for expected traffic.
- **Headers:** frontend/admin/backend include security headers/config in Vercel/app setup; verify in deployed responses.

## 7. Monitoring and observability

- **Vercel:** monitor function logs, build/deploy status, and runtime errors for frontend/admin/backend projects.
- **Uptime checks:** add external health checks for storefront, admin, and backend API (e.g. `GET /`).
- **Alerts:** configure notifications for failed deploys, elevated 5xx/error rates, webhook failures, and email delivery issues.
- **Error tracking (optional):** integrate Sentry or similar for frontend/admin/backend if deeper traceability is needed.

## 8. Post-deploy smoke test checklist

### Storefront & API
- [ ] Home/collection/product/cart/about/contact load without console errors
- [ ] `/sitemap.xml` and `/robots.txt` resolve on the production domain with correct URLs
- [ ] Register/login/logout and session persistence
- [ ] Forgot password sends email and reset works (web link); mobile deep link opens app when installed
- [ ] Search/filter/pagination, add to cart, update/remove cart items
- [ ] Checkout (COD and enabled online methods), order creation, order history/tracking
- [ ] Product images, reviews/wishlist/newsletter flows as applicable

### Admin
- [ ] Admin login succeeds with production credentials
- [ ] Dashboard, product list/add/remove, order list, and order status updates work against deployed API

### Payments & integrations
- [ ] Stripe/Razorpay payment success/cancel/verification paths
- [ ] Webhook events received and orders fulfilled/idempotently updated
- [ ] Order confirmation and password reset emails delivered (Resend)

### Mobile (against deployed API)
- [ ] `EXPO_PUBLIC_API_URL` points to deployed backend; auth/cart/orders/wishlist sync correctly
- [ ] Reset password deep link works; checkout and order tracking work
- [ ] Push token registration on login/session restore and removal on logout (device/dev build)

### Accessibility/performance sanity
- [ ] Keyboard navigation, focus states, and dark mode on key pages
- [ ] Spot-check Lighthouse/axe on critical routes if CI thresholds or content changed

## 9. Common Vercel issues
- **Frontend shows "Network Error" / products not loading:** `VITE_BACKEND_URL` is missing, points to `localhost`, or points to the wrong/protected backend URL in the Vercel build. Set it to the **public backend base URL** (no `/api` suffix), redeploy frontend, and confirm browser requests go to `https://<backend>/api/...`.
- **Frontend gets 404 on API calls:** often caused by `VITE_BACKEND_URL` ending with `/api` (app code appends `/api/...`, producing `/api/api/...`). Use the backend base URL only.
- **Admin login returns 405:** `VITE_BACKEND_URL` in the admin project is pointing to a non-backend URL (e.g. frontend/admin static site) or is malformed. Set it to the public backend base URL and redeploy admin.
- **Backend unreachable/protected:** Vercel Deployment Protection/SSO on preview URLs can block browser/API access. Use a public production backend domain and verify `GET /api/health`.
- **CORS errors:** ensure backend `CORS_ORIGINS` includes deployed frontend/admin domains and `FRONTEND_URL` is correct, then redeploy backend.
- **Env changes not reflected:** `VITE_*` changes require frontend/admin rebuilds; backend env changes require backend redeploy.
