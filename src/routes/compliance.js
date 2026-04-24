const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM compliance_screenings ORDER BY created_at DESC');
    res.json(result.rows);
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
