require('dotenv').config();
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
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);
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
// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-duties-lacks-ai-tariff-optimization-endpoint', require('./routes/gap_duties_lacks_ai_tariff_optimization_endpoint'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-shipments-lacks-ai-delay-prediction', require('./routes/gap_shipments_lacks_ai_delay_prediction'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-sanctions-lacks-ai-risk-screening-agent', require('./routes/gap_sanctions_lacks_ai_risk_screening_agent'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-documents-lacks-ai-declaration-auto-generation', require('./routes/gap_documents_lacks_ai_declaration_auto_generation'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-webhooks-for-carrier-or-government-api-pushes', require('./routes/gap_no_webhooks_for_carrier_or_government_api_pushes'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-sms-push-notifications', require('./routes/gap_no_sms_push_notifications'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-payment-duty-collection-workflow', require('./routes/gap_no_payment_duty_collection_workflow'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-calendar-scheduling', require('./routes/gap_no_calendar_scheduling'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-mobile-api-surface', require('./routes/gap_no_mobile_api_surface'));

app.listen(PORT, () => {
  console.log(`AI Customs server running on http://localhost:${PORT}`);
});
