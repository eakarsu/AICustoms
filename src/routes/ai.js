const router = require('express').Router();

async function callOpenRouter(prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'AI Customs Platform'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'OpenRouter API error');
  return data.choices?.[0]?.message?.content || 'No response generated';
}

// HS Code Classification
router.post('/classify', async (req, res) => {
  try {
    const { product_name, description, material, intended_use } = req.body;
    const prompt = `You are an expert customs classifier. Classify this product with the correct HS (Harmonized System) code. Respond in JSON format with these fields: hs_code, chapter, section, description, duty_rate_estimate, confidence, reasoning, alternative_codes (array of {code, description}).

Product: ${product_name}
Description: ${description || 'N/A'}
Material: ${material || 'N/A'}
Intended Use: ${intended_use || 'N/A'}

Return ONLY valid JSON.`;
    const result = await callOpenRouter(prompt);
    let parsed;
    try { parsed = JSON.parse(result.replace(/```json\n?|\n?```/g, '').trim()); } catch { parsed = { raw_response: result }; }
    res.json({ success: true, classification: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Compliance Screening
router.post('/screen-compliance', async (req, res) => {
  try {
    const { entity_name, entity_type, country } = req.body;
    const prompt = `You are a trade compliance expert. Screen this entity against known restricted/denied party lists. Respond in JSON format with: risk_level (low/medium/high/critical), match_found (boolean), match_score (0-100), screening_results (array of {list_name, match_type, details}), recommendations, summary.

Entity: ${entity_name}
Type: ${entity_type || 'Company'}
Country: ${country || 'Unknown'}

Return ONLY valid JSON.`;
    const result = await callOpenRouter(prompt);
    let parsed;
    try { parsed = JSON.parse(result.replace(/```json\n?|\n?```/g, '').trim()); } catch { parsed = { raw_response: result }; }
    res.json({ success: true, screening: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Sanctions Screening
router.post('/screen-sanctions', async (req, res) => {
  try {
    const { entity_name, entity_type, country } = req.body;
    const prompt = `You are a sanctions compliance expert. Screen this entity against international sanctions lists (OFAC SDN, EU Consolidated, UN Sanctions). Respond in JSON format with: risk_score (0-100), sanctions_status (clear/potential_match/confirmed_match), lists_checked (array), matches (array of {list, match_type, confidence, details}), embargo_status, recommendations, summary.

Entity: ${entity_name}
Type: ${entity_type || 'Company'}
Country: ${country || 'Unknown'}

Return ONLY valid JSON.`;
    const result = await callOpenRouter(prompt);
    let parsed;
    try { parsed = JSON.parse(result.replace(/```json\n?|\n?```/g, '').trim()); } catch { parsed = { raw_response: result }; }
    res.json({ success: true, sanctions: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Duty Calculation
router.post('/calculate-duty', async (req, res) => {
  try {
    const { product_name, hs_code, origin_country, destination_country, declared_value, currency } = req.body;
    const prompt = `You are a customs duty calculation expert. Calculate import duties and taxes for this shipment. Respond in JSON format with: duty_rate (percentage), duty_amount, vat_rate, vat_amount, excise_tax, processing_fee, total_landed_cost, applicable_agreements (array), duty_savings, calculation_breakdown (array of {item, rate, amount}), notes.

Product: ${product_name}
HS Code: ${hs_code || 'Unknown'}
Origin: ${origin_country}
Destination: ${destination_country}
Declared Value: ${declared_value} ${currency || 'USD'}

Return ONLY valid JSON.`;
    const result = await callOpenRouter(prompt);
    let parsed;
    try { parsed = JSON.parse(result.replace(/```json\n?|\n?```/g, '').trim()); } catch { parsed = { raw_response: result }; }
    res.json({ success: true, calculation: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Document Generation
router.post('/generate-document', async (req, res) => {
  try {
    const { document_type, shipper, consignee, goods_description, origin_country, destination_country, declared_value } = req.body;
    const prompt = `You are a customs documentation expert. Generate a ${document_type || 'Commercial Invoice'} for this shipment. Respond in JSON format with: document_title, reference_number, date, shipper_details, consignee_details, goods (array of {description, quantity, unit_price, total}), subtotal, terms_of_sale, declarations (array of strings), certifications, special_instructions, regulatory_notes.

Shipper: ${shipper}
Consignee: ${consignee}
Goods: ${goods_description}
Origin: ${origin_country}
Destination: ${destination_country}
Value: ${declared_value || 'TBD'}

Return ONLY valid JSON.`;
    const result = await callOpenRouter(prompt);
    let parsed;
    try { parsed = JSON.parse(result.replace(/```json\n?|\n?```/g, '').trim()); } catch { parsed = { raw_response: result }; }
    res.json({ success: true, document: parsed });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
