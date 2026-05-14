const router = require('express').Router();

// GET /api/compliance/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    const [totalResult, riskResult, pendingResult, highRiskShipments, recentScreenings] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, risk_level, COUNT(*) FILTER (WHERE status = \'pass\') as passed, COUNT(*) FILTER (WHERE status = \'fail\') as failed FROM compliance_screenings GROUP BY risk_level'),
      pool.query('SELECT risk_level, COUNT(*) as count FROM compliance_screenings GROUP BY risk_level ORDER BY count DESC'),
      pool.query("SELECT COUNT(*) as count FROM compliance_screenings WHERE status = 'pending'"),
      pool.query("SELECT s.*, cs.risk_level, cs.status as compliance_status FROM shipments s LEFT JOIN compliance_screenings cs ON cs.entity_name = s.consignee WHERE cs.risk_level IN ('high', 'critical') ORDER BY s.created_at DESC LIMIT 10"),
      pool.query('SELECT * FROM compliance_screenings ORDER BY created_at DESC LIMIT 20')
    ]);

    const summary = {
      by_risk_level: riskResult.rows,
      pending_reviews: parseInt(pendingResult.rows[0]?.count || 0),
      screening_breakdown: totalResult.rows,
    };

    res.json({
      success: true,
      dashboard: {
        summary,
        high_risk_shipments: highRiskShipments.rows,
        recent_screenings: recentScreenings.rows
      }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/compliance/export (CSV)
router.get('/export', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const result = await pool.query('SELECT * FROM compliance_screenings ORDER BY created_at DESC');
    const rows = result.rows;

    const headers = ['id', 'entity_name', 'entity_type', 'country', 'screening_type', 'risk_level', 'status', 'match_score', 'screened_by', 'created_at', 'updated_at'];

    const csvLines = [headers.join(',')];
    for (const row of rows) {
      const values = headers.map(h => {
        const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvLines.push(values.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="compliance_screenings_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvLines.join('\n'));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET all screenings (paginated)
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const [result, countResult] = await Promise.all([
      pool.query('SELECT * FROM compliance_screenings ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
      pool.query('SELECT COUNT(*) as total FROM compliance_screenings')
    ]);

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM compliance_screenings WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { entity_name, entity_type, country, screening_type, risk_level, status, match_score, details, screened_by } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO compliance_screenings (entity_name, entity_type, country, screening_type, risk_level, status, match_score, details, screened_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [entity_name, entity_type, country, screening_type, risk_level, status, match_score, details, screened_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { entity_name, entity_type, country, screening_type, risk_level, status, match_score, details, screened_by } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE compliance_screenings SET entity_name=$1, entity_type=$2, country=$3, screening_type=$4, risk_level=$5, status=$6, match_score=$7, details=$8, screened_by=$9, updated_at=NOW() WHERE id=$10 RETURNING *',
      [entity_name, entity_type, country, screening_type, risk_level, status, match_score, details, screened_by, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM compliance_screenings WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
