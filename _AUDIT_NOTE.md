# AICustoms — Audit Note

## Bucket: A — DETECTOR_FALSE_POSITIVE

The original audit (`/Users/erolakarsu/projects/_AUDIT/reports/batch_02.md`, "## AICustoms") claimed AICustoms had "0 routes, 0 AI endpoints, backend missing" and was a "Skeleton with only frontend stub." This is a **false positive**.

## Stack

Node / Express backend (`src/server.js`), 13 route files, JWT auth, custom DB and middleware. Client lives in `client/`.

## Existing AI inventory (preserve)

- `/Users/erolakarsu/projects/AICustoms/src/routes/ai.js` — `POST /classify`, `/screen-compliance`, `/screen-sanctions`, `/calculate-duty`, `/generate-document`. OpenRouter (`https://openrouter.ai/api/v1/chat/completions`) with customs-broker system prompt, JSON-parsing retry, validators.
- `/Users/erolakarsu/projects/AICustoms/src/routes/aiNew.js` — `POST /export-controls`, `/country-risk`, `/landed-cost-optimizer`, `/broker-instruction`.
- Other domain routes: `agreements`, `audit`, `auth`, `compliance`, `documents`, `duties`, `hsCodes`, `products`, `regulations`, `sanctions`, `shipments`.

## Audit recommendations vs reality

The audit's three "custom suggestions" are effectively already implemented:

- Tariff & compliance optimization → `aiNew.js /landed-cost-optimizer` + `ai.js /classify` + `/calculate-duty`.
- Supply-chain visibility → shipments + sanctions + audit routes exist; AI screening over them via `/screen-compliance` / `/screen-sanctions`.
- Customs declaration automation → `ai.js /generate-document` + `aiNew.js /broker-instruction`.

What's genuinely missing is orchestration that chains these (e.g., a single "process this PO" endpoint that classifies, screens, calculates duty, and emits a declaration draft).

## Apply pass — implemented

Nothing was modified. The existing AI surface already covers the audit recommendations; the only mechanical gap is an orchestration endpoint, but the orchestration ordering (and what failures should hard-stop vs warn) is a product decision worth deferring.

## Backlog (prioritized)

1. [PRODUCT-DECISION] Orchestration endpoint `POST /api/ai/process-shipment` chaining classify → screen-compliance → screen-sanctions → calculate-duty → generate-document. Decisions needed: hard-stop on which screening failures, partial-result schema.
2. [MECHANICAL-ish but RISKY] Add an `/api/ai/health` route that probes OpenRouter reachability — small but touches secret handling; would mirror existing pattern.
3. [PRODUCT-DECISION] Real-time shipment delay alerts — needs source data (carrier integration creds) and notification channel.
4. [NEEDS-CREDS] Carrier / port integrations (FedEx, DHL, port APIs).
5. [PRODUCT-DECISION] PO ingestion pipeline (CSV / EDI / API) feeding the orchestrator.

## Files touched in this pass

- `/Users/erolakarsu/projects/AICustoms/_AUDIT_NOTE.md` (this file).

No source files were modified. Syntax: N/A.

## Apply pass 3 (frontend)

The audit's `aiNew.js` endpoints (`/export-controls`, `/country-risk`, `/landed-cost-optimizer`, `/broker-instruction`) had no frontend wiring. Existing FE only covered `/classify`, `/screen-compliance`, `/screen-sanctions`.

Created `client/src/pages/TradeTools.jsx` — a single-page tabbed UI exposing all four `aiNew.js` endpoints, matching the existing inline-style aesthetic from `Classify.jsx` / `Screen.jsx`. Adds a `/trade-tools` route and nav link to `App.jsx`. JWT Bearer header pulled from `localStorage.getItem('token')` if present (forward-compatible — current AI routes are unauthenticated server-side); 503 responses surface a "no API key configured" warning. No new dependencies, no `npm install`. Vite proxy already routes `/api` to `http://localhost:3001`.

Files: `client/src/pages/TradeTools.jsx` (new), `client/src/App.jsx` (route + nav). esbuild JSX syntax check: pass.
