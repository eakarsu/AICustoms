const router = require('express').Router();

router.get('/', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM audit_trail ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await req.app.locals.pool.query('SELECT * FROM audit_trail WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { action, module, entity_type, entity_id, user_name, user_email, details, ip_address, status, risk_level } = req.body;
    const result = await req.app.locals.pool.query(
      'INSERT INTO audit_trail (action, module, entity_type, entity_id, user_name, user_email, details, ip_address, status, risk_level) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [action, module, entity_type, entity_id, user_name, user_email, details, ip_address, status, risk_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { action, module, entity_type, entity_id, user_name, user_email, details, ip_address, status, risk_level } = req.body;
    const result = await req.app.locals.pool.query(
      'UPDATE audit_trail SET action=$1, module=$2, entity_type=$3, entity_id=$4, user_name=$5, user_email=$6, details=$7, ip_address=$8, status=$9, risk_level=$10 WHERE id=$11 RETURNING *',
      [action, module, entity_type, entity_id, user_name, user_email, details, ip_address, status, risk_level, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM audit_trail WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
