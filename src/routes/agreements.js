const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM trade_agreements ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM trade_agreements WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { agreement_name, acronym, member_countries, effective_date, expiry_date, status, tariff_reduction, eligible_products, rules_of_origin, notes } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO trade_agreements (agreement_name, acronym, member_countries, effective_date, expiry_date, status, tariff_reduction, eligible_products, rules_of_origin, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [agreement_name, acronym, member_countries, effective_date, expiry_date, status, tariff_reduction, eligible_products, rules_of_origin, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { agreement_name, acronym, member_countries, effective_date, expiry_date, status, tariff_reduction, eligible_products, rules_of_origin, notes } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE trade_agreements SET agreement_name=$1, acronym=$2, member_countries=$3, effective_date=$4, expiry_date=$5, status=$6, tariff_reduction=$7, eligible_products=$8, rules_of_origin=$9, notes=$10, updated_at=NOW() WHERE id=$11 RETURNING *',
      [agreement_name, acronym, member_countries, effective_date, expiry_date, status, tariff_reduction, eligible_products, rules_of_origin, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM trade_agreements WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
