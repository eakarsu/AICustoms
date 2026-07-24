require('dotenv').config();
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const { aiRateLimiter, generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3001;

// Database pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Make pool available to routes
app.locals.pool = pool;

// Middleware
const origins=(process.env.CORS_ORIGINS||'http://localhost:3000').split(',').map(v=>v.trim()).filter(Boolean);
app.use(cors({origin(orig,cb){if(!orig||origins.includes(orig))return cb(null,true);return cb(new Error('origin not allowed'));},credentials:true}));
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);
app.get('/runtime-config.js', (_req, res) => {
  const enabled = process.env.NODE_ENV !== 'production'
    && process.env.ENABLE_DEMO_CREDENTIAL_AUTOFILL !== 'false'
    && process.env.DEMO_EMAIL && process.env.DEMO_PASSWORD;
  const credentials = enabled ? { email: process.env.DEMO_EMAIL, password: process.env.DEMO_PASSWORD } : null;
  res.type('application/javascript').send(`window.DEMO_CREDENTIALS=${JSON.stringify(credentials)};`);
});
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hs-codes', require('./routes/hsCodes'));
app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/duties', require('./routes/duties'));
app.use('/api/regulations', require('./routes/regulations'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/agreements', require('./routes/agreements'));
app.use('/api/sanctions', require('./routes/sanctions'));
app.use('/api/products', require('./routes/products'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/ai', aiRateLimiter, require('./routes/ai'));
app.use('/api/ai', aiRateLimiter, require('./routes/aiNew'));





app.use('/api/ai', require('./routes/sanctionsAgent'));
app.use('/api/ai', require('./routes/declarationAuto'));
app.use('/api/ai', require('./routes/supplyVisibility'));
app.use('/api/ai', require('./routes/tariffOptimize'));
app.use('/api/ftz-admission-reconciliation', require('./routes/ftzAdmissionReconciliation'));
app.use('/api/governed-cases', require('./routes/governedCases'));
// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Generated gap routers are deliberately quarantined and are not mounted.

app.listen(PORT, () => {
  console.log(`AI Customs server running on http://localhost:${PORT}`);
});
