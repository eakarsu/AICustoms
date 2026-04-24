const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM country_regulations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM country_regulations WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { country, country_code, regulation_type, title, description, effective_date, expiry_date, status, authority, restricted_items, documentation_required } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO country_regulations (country, country_code, regulation_type, title, description, effective_date, expiry_date, status, authority, restricted_items, documentation_required) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [country, country_code, regulation_type, title, description, effective_date, expiry_date, status, authority, restricted_items, documentation_required]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { country, country_code, regulation_type, title, description, effective_date, expiry_date, status, authority, restricted_items, documentation_required } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE country_regulations SET country=$1, country_code=$2, regulation_type=$3, title=$4, description=$5, effective_date=$6, expiry_date=$7, status=$8, authority=$9, restricted_items=$10, documentation_required=$11, updated_at=NOW() WHERE id=$12 RETURNING *',
      [country, country_code, regulation_type, title, description, effective_date, expiry_date, status, authority, restricted_items, documentation_required, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM country_regulations WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
