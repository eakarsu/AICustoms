const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM hs_codes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM hs_codes WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { product_name, description, hs_code, chapter, section, duty_rate, country_origin, notes } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO hs_codes (product_name, description, hs_code, chapter, section, duty_rate, country_origin, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [product_name, description, hs_code, chapter, section, duty_rate, country_origin, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { product_name, description, hs_code, chapter, section, duty_rate, country_origin, notes } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE hs_codes SET product_name=$1, description=$2, hs_code=$3, chapter=$4, section=$5, duty_rate=$6, country_origin=$7, notes=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [product_name, description, hs_code, chapter, section, duty_rate, country_origin, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM hs_codes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
