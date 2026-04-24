const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM customs_documents ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM customs_documents WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { document_type, reference_number, shipper, consignee, origin_country, destination_country, goods_description, declared_value, currency, status, notes } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO customs_documents (document_type, reference_number, shipper, consignee, origin_country, destination_country, goods_description, declared_value, currency, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [document_type, reference_number, shipper, consignee, origin_country, destination_country, goods_description, declared_value, currency, status, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { document_type, reference_number, shipper, consignee, origin_country, destination_country, goods_description, declared_value, currency, status, notes } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE customs_documents SET document_type=$1, reference_number=$2, shipper=$3, consignee=$4, origin_country=$5, destination_country=$6, goods_description=$7, declared_value=$8, currency=$9, status=$10, notes=$11, updated_at=NOW() WHERE id=$12 RETURNING *',
      [document_type, reference_number, shipper, consignee, origin_country, destination_country, goods_description, declared_value, currency, status, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM customs_documents WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
