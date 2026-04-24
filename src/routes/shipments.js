const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM shipments WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { tracking_number, carrier, origin_country, destination_country, shipper, consignee, goods_description, declared_value, currency, weight_kg, compliance_status, customs_status, estimated_arrival, notes } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO shipments (tracking_number, carrier, origin_country, destination_country, shipper, consignee, goods_description, declared_value, currency, weight_kg, compliance_status, customs_status, estimated_arrival, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *',
      [tracking_number, carrier, origin_country, destination_country, shipper, consignee, goods_description, declared_value, currency, weight_kg, compliance_status, customs_status, estimated_arrival, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { tracking_number, carrier, origin_country, destination_country, shipper, consignee, goods_description, declared_value, currency, weight_kg, compliance_status, customs_status, estimated_arrival, notes } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE shipments SET tracking_number=$1, carrier=$2, origin_country=$3, destination_country=$4, shipper=$5, consignee=$6, goods_description=$7, declared_value=$8, currency=$9, weight_kg=$10, compliance_status=$11, customs_status=$12, estimated_arrival=$13, notes=$14, updated_at=NOW() WHERE id=$15 RETURNING *',
      [tracking_number, carrier, origin_country, destination_country, shipper, consignee, goods_description, declared_value, currency, weight_kg, compliance_status, customs_status, estimated_arrival, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM shipments WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
