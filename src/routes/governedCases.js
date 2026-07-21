'use strict';
const express = require('express');
const auth = require('../middleware/auth');
const { normalizeTradeCase, snapshotHash, assertTransition } = require('../services/complianceCasePolicy');
const router = express.Router();
router.use(auth);

async function membership(client, tenantId, userId) {
  const found = await client.query('SELECT role FROM customs_tenant_memberships WHERE tenant_id=$1 AND user_id=$2 AND active=true', [tenantId, userId]);
  if (!found.rows[0]) { const error = new Error('tenant membership required'); error.status = 403; throw error; }
  return found.rows[0].role;
}

router.post('/', async (req, res) => {
  const pool = req.app.locals.pool; let client;
  try {
    client = await pool.connect();
    const tenantId = String(req.body.tenantId || '');
    const key = String(req.get('Idempotency-Key') || '');
    if (!tenantId || !key) throw new Error('tenantId and Idempotency-Key are required');
    const trade = normalizeTradeCase(req.body.tradeCase);
    await client.query('BEGIN');
    await membership(client, tenantId, req.user.id);
    const created = await client.query(
      `INSERT INTO customs_cases(tenant_id,external_reference,effective_at,jurisdiction,intake_snapshot,intake_hash,idempotency_key,created_by)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(tenant_id,idempotency_key) DO UPDATE SET idempotency_key=EXCLUDED.idempotency_key RETURNING *`,
      [tenantId, trade.externalReference, trade.effectiveAt, trade.jurisdiction, trade, snapshotHash(trade), key, req.user.id]
    );
    await client.query(`INSERT INTO customs_audit_events(tenant_id,case_id,actor_id,action,payload) VALUES($1,$2,$3,'case.intake',$4)`, [tenantId, created.rows[0].id, req.user.id, created.rows[0]]);
    await client.query('COMMIT'); res.status(201).json(created.rows[0]);
  } catch (error) { if (client) await client.query('ROLLBACK'); res.status(error.status || 422).json({ error:error.message }); }
  finally { client?.release(); }
});

router.post('/:id/reviews', async (req, res) => {
  const pool = req.app.locals.pool; let client;
  try {
    client = await pool.connect(); await client.query('BEGIN');
    const record = (await client.query('SELECT * FROM customs_cases WHERE id=$1', [req.params.id])).rows[0];
    if (!record) { const error = new Error('case not found'); error.status = 404; throw error; }
    const role = await membership(client, record.tenant_id, req.user.id);
    if (role !== 'compliance_reviewer') { const error = new Error('compliance reviewer role required'); error.status = 403; throw error; }
    if (!['approved','rejected'].includes(req.body.decision) || !String(req.body.rationale || '').trim()) throw new Error('decision and rationale are required');
    const review = await client.query(
      `INSERT INTO customs_approvals(case_id,reviewer_id,decision,rationale) VALUES($1,$2,$3,$4)
       ON CONFLICT(case_id,reviewer_id) DO UPDATE SET decision=EXCLUDED.decision,rationale=EXCLUDED.rationale,created_at=NOW() RETURNING *`,
      [record.id, req.user.id, req.body.decision, req.body.rationale]
    );
    await client.query(`INSERT INTO customs_audit_events(tenant_id,case_id,actor_id,action,payload) VALUES($1,$2,$3,'case.reviewed',$4)`, [record.tenant_id, record.id, req.user.id, review.rows[0]]);
    await client.query('COMMIT'); res.status(201).json(review.rows[0]);
  } catch (error) { if (client) await client.query('ROLLBACK'); res.status(error.status || 422).json({ error:error.message }); }
  finally { client?.release(); }
});

router.post('/:id/transition', async (req, res) => {
  const pool = req.app.locals.pool; let client;
  try {
    client = await pool.connect(); await client.query('BEGIN');
    const found = await client.query('SELECT * FROM customs_cases WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!found.rows[0]) { const error = new Error('case not found'); error.status = 404; throw error; }
    const record = found.rows[0];
    const role = await membership(client, record.tenant_id, req.user.id);
    const context = { ...req.body.context };
    if (req.body.to === 'dual_approved') {
      const reviews = await client.query(`SELECT reviewer_id FROM customs_approvals WHERE case_id=$1 AND decision='approved' ORDER BY reviewer_id`, [record.id]);
      if (reviews.rows.length < 2) throw new Error('two durable approvals are required');
      context.firstReviewerId = reviews.rows[0].reviewer_id;
      context.secondReviewerId = reviews.rows[1].reviewer_id;
    }
    assertTransition(record.status, req.body.to, role, context);
    const updated = await client.query('UPDATE customs_cases SET status=$1,version=version+1,updated_at=NOW() WHERE id=$2 AND version=$3 RETURNING *', [req.body.to, record.id, req.body.expectedVersion]);
    if (!updated.rows[0]) { const error = new Error('version conflict'); error.status = 409; throw error; }
    if (req.body.to === 'classified' || req.body.to === 'screened') {
      await client.query(
        `INSERT INTO customs_decisions(case_id,decision_type,decision,explanation,source_version_ids,match_score,threshold,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
        [record.id, req.body.to, req.body.to === 'classified' ? context.hsCode : 'screened', context.reasoning || 'effective watchlist screen', context.sourceVersionIds || [], context.matchScore || null, context.matchThreshold || null, req.user.id]
      );
    }
    await client.query('INSERT INTO customs_audit_events(tenant_id,case_id,actor_id,action,payload) VALUES($1,$2,$3,$4,$5)', [record.tenant_id, record.id, req.user.id, `case.${req.body.to}`, { before:record, after:updated.rows[0], context }]);
    if (req.body.to === 'filed') await client.query('INSERT INTO customs_filings(case_id,payload_hash,gateway_receipt,source_snapshot,created_by) VALUES($1,$2,$3,$4,$5)', [record.id, context.payloadHash, context.gatewayReceipt, context.sourceSnapshot, req.user.id]);
    await client.query('COMMIT'); res.json(updated.rows[0]);
  } catch (error) { if (client) await client.query('ROLLBACK'); res.status(error.status || 422).json({ error:error.message }); }
  finally { client?.release(); }
});
module.exports = router;
