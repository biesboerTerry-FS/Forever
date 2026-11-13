#!/usr/bin/env bash
# Start the full Forever stack: backend, storefront and admin panel.
# Requires: Node.js, MongoDB running locally (mongod), and .env files set up
# (copy each .env.example to .env first).
set -e
cd "$(dirname "$0")"

echo "Starting Forever…"
echo "  backend   → http://localhost:4001"
echo "  storefront→ http://localhost:5178"
echo "  admin     → http://localhost:5179"
echo "(new accounts: run 'cd backend && npm run seed' once to load the catalog)"
echo ""

( cd backend  && npm run start ) &
( cd frontend && npm run dev ) &
( cd admin    && npm run dev ) &

echo "All services starting — Ctrl+C stops everything."
wait
