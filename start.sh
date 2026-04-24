#!/bin/bash

echo "========================================="
echo "  AI Customs & Trade Compliance Platform"
echo "========================================="
echo ""

# Kill any processes on port 3001
echo "[1/6] Killing processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
echo "  Done."

# Drop and recreate database
echo "[2/6] Recreating database..."
dropdb ai_customs 2>/dev/null || true
createdb ai_customs
echo "  Database 'ai_customs' created."

# Install dependencies
echo "[3/6] Installing dependencies..."
cd "$(dirname "$0")"
npm install --silent
echo "  Dependencies installed."

# Run migrations
echo "[4/6] Running migrations..."
node src/db/migrate.js
echo "  Migrations complete."

# Seed data
echo "[5/6] Seeding data..."
node src/db/seed.js
echo "  Seed data inserted."

# Start server
echo "[6/6] Starting server..."
echo ""
echo "========================================="
echo "  Server: http://localhost:3001"
echo "  Login:  admin@aicustoms.com / admin123"
echo "========================================="
echo ""

if command -v nodemon &> /dev/null; then
  nodemon src/server.js
else
  node --watch src/server.js 2>/dev/null || node src/server.js
fi
