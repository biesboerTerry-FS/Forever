// Test environment URLs and credentials. Override with env vars, e.g.
//   FRONTEND_URL=http://localhost:5178 API_URL=http://localhost:4001 npm test
export const FRONTEND_URL =
	process.env.FRONTEND_URL || "http://localhost:5178";
export const ADMIN_URL = process.env.ADMIN_URL || "http://localhost:5179";
export const API_URL = process.env.API_URL || "http://localhost:4001";

// Must match the ADMIN_EMAIL / ADMIN_PASSWORD in backend/.env
// (or the values printed by `npm run seed`).
export const ADMIN_EMAIL =
	process.env.E2E_ADMIN_EMAIL || "admin@admin.com";
export const ADMIN_PASSWORD =
	process.env.E2E_ADMIN_PASSWORD || "admin";
