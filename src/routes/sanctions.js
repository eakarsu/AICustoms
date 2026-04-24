const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM sanctions_screenings ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM sanctions_screenings WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { entity_name, entity_type, country, sanctions_list, risk_score, status, match_details, sanctions_type, authority, screened_by } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO sanctions_screenings (entity_name, entity_type, country, sanctions_list, risk_score, status, match_details, sanctions_type, authority, screened_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [entity_name, entity_type, country, sanctions_list, risk_score, status, match_details, sanctions_type, authority, screened_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { entity_name, entity_type, country, sanctions_list, risk_score, status, match_details, sanctions_type, authority, screened_by } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE sanctions_screenings SET entity_name=$1, entity_type=$2, country=$3, sanctions_list=$4, risk_score=$5, status=$6, match_details=$7, sanctions_type=$8, authority=$9, screened_by=$10, updated_at=NOW() WHERE id=$11 RETURNING *',
      [entity_name, entity_type, country, sanctions_list, risk_score, status, match_details, sanctions_type, authority, screened_by, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM sanctions_screenings WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
