#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "$0")" && pwd)"
[[ -f "$project_dir/.env" ]] || { echo 'Missing .env; copy .env.example and configure it.' >&2; exit 1; }
[[ -d "$project_dir/node_modules" && -d "$project_dir/client/node_modules" ]] || { echo 'Dependencies missing; run scripts/bootstrap.sh.' >&2; exit 1; }
set -a; source "$project_dir/.env"; set +a
: "${DATABASE_URL:?DATABASE_URL is required}"; : "${JWT_SECRET:?JWT_SECRET is required}"
[[ ${#JWT_SECRET} -ge 32 ]] || { echo 'JWT_SECRET must contain at least 32 characters.' >&2; exit 1; }
if [[ "${MIGRATE_ON_START:-false}" == true ]]; then npm --prefix "$project_dir" run migrate; node "$project_dir/src/db/provision-admin.js"; fi
(cd "$project_dir" && npm start) & backend_pid=$!
(cd "$project_dir/client" && npm run dev -- --host "${FRONTEND_HOST:-127.0.0.1}" --port "${FRONTEND_PORT:-3000}") & frontend_pid=$!
cleanup(){ kill "$backend_pid" "$frontend_pid" 2>/dev/null || true; wait "$backend_pid" "$frontend_pid" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
wait "$backend_pid" "$frontend_pid"
