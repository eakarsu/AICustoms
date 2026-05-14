const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const [result, countResult] = await Promise.all([
      pool.query('SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
      pool.query('SELECT COUNT(*) as total FROM products')
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
    const result = await req.app.locals.pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { product_name, sku, category, hs_code, description, country_origin, unit_value, currency, weight_kg, material, manufacturer, export_controlled } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO products (product_name, sku, category, hs_code, description, country_origin, unit_value, currency, weight_kg, material, manufacturer, export_controlled) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
      [product_name, sku, category, hs_code, description, country_origin, unit_value, currency, weight_kg, material, manufacturer, export_controlled]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { product_name, sku, category, hs_code, description, country_origin, unit_value, currency, weight_kg, material, manufacturer, export_controlled } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE products SET product_name=$1, sku=$2, category=$3, hs_code=$4, description=$5, country_origin=$6, unit_value=$7, currency=$8, weight_kg=$9, material=$10, manufacturer=$11, export_controlled=$12, updated_at=NOW() WHERE id=$13 RETURNING *',
      [product_name, sku, category, hs_code, description, country_origin, unit_value, currency, weight_kg, material, manufacturer, export_controlled, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
