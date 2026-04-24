const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM duty_calculations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM duty_calculations WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { product_name, hs_code, origin_country, destination_country, declared_value, currency, duty_rate, duty_amount, tax_rate, tax_amount, total_fees, trade_agreement, notes } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO duty_calculations (product_name, hs_code, origin_country, destination_country, declared_value, currency, duty_rate, duty_amount, tax_rate, tax_amount, total_fees, trade_agreement, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',
      [product_name, hs_code, origin_country, destination_country, declared_value, currency, duty_rate, duty_amount, tax_rate, tax_amount, total_fees, trade_agreement, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { product_name, hs_code, origin_country, destination_country, declared_value, currency, duty_rate, duty_amount, tax_rate, tax_amount, total_fees, trade_agreement, notes } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE duty_calculations SET product_name=$1, hs_code=$2, origin_country=$3, destination_country=$4, declared_value=$5, currency=$6, duty_rate=$7, duty_amount=$8, tax_rate=$9, tax_amount=$10, total_fees=$11, trade_agreement=$12, notes=$13, updated_at=NOW() WHERE id=$14 RETURNING *',
      [product_name, hs_code, origin_country, destination_country, declared_value, currency, duty_rate, duty_amount, tax_rate, tax_amount, total_fees, trade_agreement, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM duty_calculations WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
