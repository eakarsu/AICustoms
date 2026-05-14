const router = require('express').Router();
const { body, validationResult } = require('express-validator');

const SYSTEM_PROMPT = "You are an expert customs broker and international trade compliance specialist with deep knowledge of HTS codes, OFAC/EU/UN sanctions, export control regulations, and trade agreements including USMCA, EU-US, CPTPP.";

async function callOpenRouter(prompt) {
  const makeRequest = async (userPrompt) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'AI Customs Platform'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-5-sonnet-20241022',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 3000
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'OpenRouter API error');
    return data.choices?.[0]?.message?.content || 'No response generated';
  };

  const raw = await makeRequest(prompt);
  try {
    return JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
  } catch {
    const retryRaw = await makeRequest(
      prompt + '\n\nReturn ONLY valid JSON, no markdown, no explanation, no code fences.'
    );
    try {
      return JSON.parse(retryRaw.replace(/```json\n?|\n?```/g, '').trim());
    } catch {
      return { raw_response: raw, parse_error: 'AI returned non-JSON after retry' };
    }
  }
}

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// POST /api/ai/export-controls
router.post('/export-controls',
  body('product_description').notEmpty().withMessage('product_description is required'),
  body('destination_country').isLength({ min: 2, max: 2 }).withMessage('destination_country must be 2-letter ISO code'),
  validate,
  async (req, res) => {
    try {
      const { product_description, eccn_number, destination_country } = req.body;
      const prompt = `Analyze export control requirements for this product and destination. Return JSON with fields:
- classification: { eccn: string, ear_controlled: boolean, itar_controlled: boolean, ccl_category: string }
- license_requirement: { required: boolean, license_type: string|null, exceptions_available: string[], notes: string }
- end_use_restrictions: string[]
- prohibited_end_uses: string[]
- country_specific_notes: string
- recommended_actions: string[]
- risk_level: "low"|"medium"|"high"|"critical"

Product: ${product_description}
ECCN (if known): ${eccn_number || 'Unknown'}
Destination Country: ${destination_country}

Return ONLY valid JSON.`;
      const result = await callOpenRouter(prompt);
      res.json({ success: true, export_controls: result });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

// POST /api/ai/country-risk
router.post('/country-risk',
  body('country_code').isLength({ min: 2, max: 2 }).withMessage('country_code must be 2-letter ISO code'),
  body('trade_purpose').notEmpty().withMessage('trade_purpose is required'),
  validate,
  async (req, res) => {
    try {
      const { country_code, trade_purpose } = req.body;
      const prompt = `Assess trade risk for the specified country and purpose. Return JSON with fields:
- risk_score: number (0-100, higher = riskier)
- risk_level: "low"|"medium"|"high"|"critical"
- sanctions_status: { ofac: string, eu: string, un: string, overall: string }
- trade_barriers: { tariff_barriers: string[], non_tariff_barriers: string[], import_restrictions: string[] }
- required_certifications: string[]
- corruption_index_notes: string
- political_stability_notes: string
- recommended_precautions: string[]
- trade_agreements: string[]
- summary: string

Country Code: ${country_code}
Trade Purpose: ${trade_purpose}

Return ONLY valid JSON.`;
      const result = await callOpenRouter(prompt);
      res.json({ success: true, country_risk: result });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

// POST /api/ai/landed-cost-optimizer
router.post('/landed-cost-optimizer',
  body('product').notEmpty().withMessage('product is required'),
  body('origin').isLength({ min: 2, max: 2 }).withMessage('origin must be 2-letter ISO code'),
  body('destinations').isArray({ min: 1 }).withMessage('destinations must be a non-empty array'),
  validate,
  async (req, res) => {
    try {
      const { product, origin, destinations } = req.body;
      const prompt = `Compare landed costs for shipping this product from origin to multiple destinations. Return JSON with fields:
- origin: string
- product_summary: string
- route_comparisons: array of {
    destination: string,
    estimated_duty_rate: string,
    estimated_vat_rate: string,
    applicable_trade_agreements: string[],
    estimated_duty_amount: string,
    estimated_total_taxes: string,
    compliance_complexity: "low"|"medium"|"high",
    estimated_transit_days: number,
    special_requirements: string[],
    landed_cost_score: number (lower is cheaper/easier)
  }
- recommended_route: string
- recommendation_reasoning: string
- potential_savings_vs_worst_route: string

Product: ${JSON.stringify(product)}
Origin Country: ${origin}
Destinations to Compare: ${JSON.stringify(destinations)}

Return ONLY valid JSON.`;
      const result = await callOpenRouter(prompt);
      res.json({ success: true, landed_cost_analysis: result });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

// POST /api/ai/broker-instruction
router.post('/broker-instruction',
  body('shipment_id').notEmpty().withMessage('shipment_id is required'),
  validate,
  async (req, res) => {
    try {
      const { shipment_id } = req.body;
      const pool = req.app.locals.pool;

      // Fetch shipment from DB
      const shipmentResult = await pool.query('SELECT * FROM shipments WHERE id = $1', [shipment_id]);
      if (!shipmentResult.rows[0]) {
        return res.status(404).json({ error: 'Shipment not found' });
      }
      const shipment = shipmentResult.rows[0];

      const prompt = `Generate a complete customs broker instruction letter for this shipment. Return JSON with fields:
- letter_header: { date: string, reference_number: string, broker_attention: string }
- shipper: { name: string, address: string, contact: string }
- consignee: { name: string, address: string, contact: string }
- shipment_details: { tracking_number: string, carrier: string, origin: string, destination: string, estimated_arrival: string }
- goods_description: string
- customs_classification: { hs_code: string|null, declared_value: string, currency: string }
- special_instructions: string[]
- required_documents: string[]
- compliance_notes: string[]
- broker_action_items: string[]
- letter_body: string (full formatted letter text)

Shipment Data:
${JSON.stringify(shipment, null, 2)}

Return ONLY valid JSON.`;
      const result = await callOpenRouter(prompt);
      res.json({ success: true, broker_instruction: result, shipment });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

module.exports = router;
