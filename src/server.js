require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Database pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Make pool available to routes
app.locals.pool = pool;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
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
app.use('/api/ai', require('./routes/ai'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI Customs server running on http://localhost:${PORT}`);
});
