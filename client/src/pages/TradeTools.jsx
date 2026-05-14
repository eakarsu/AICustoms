import React, { useState } from 'react';

const card = { background: '#fff', borderRadius: '10px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', maxWidth: '760px' };
const label = { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' };
const input = {
  width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '6px',
  fontSize: '0.95rem', marginBottom: '1rem', outline: 'none', boxSizing: 'border-box'
};
const textarea = { ...input, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' };
const select = { ...input };
const btn = (color) => ({
  background: color, color: '#fff', border: 'none', borderRadius: '6px',
  padding: '0.7rem 1.6rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer'
});
const h1 = { fontSize: '1.6rem', fontWeight: 700, marginBottom: '1rem', color: '#1a2340' };
const tabsBar = { display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' };
const tab = (active) => ({
  padding: '0.55rem 1.1rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
  background: active ? '#1a2340' : '#e2e8f0', color: active ? '#fff' : '#1a2340', border: 'none'
});
const resultBox = { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '1.2rem', marginTop: '1.25rem' };
const errorBox = { color: '#ef4444', marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' };
const warnBox = { color: '#92400e', marginTop: '1rem', padding: '0.75rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '6px' };

const TOOLS = [
  { key: 'export-controls', label: 'Export Controls', endpoint: '/api/ai/export-controls', resultKey: 'export_controls' },
  { key: 'country-risk', label: 'Country Risk', endpoint: '/api/ai/country-risk', resultKey: 'country_risk' },
  { key: 'landed-cost', label: 'Landed Cost Optimizer', endpoint: '/api/ai/landed-cost-optimizer', resultKey: 'landed_cost_analysis' },
  { key: 'broker-instruction', label: 'Broker Instruction', endpoint: '/api/ai/broker-instruction', resultKey: 'broker_instruction' }
];

function authHeaders() {
  // JWT Bearer from localStorage if present (some AICustoms routes use auth, AI routes do not — included for forward-compat)
  const headers = { 'Content-Type': 'application/json' };
  try {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (_) { /* ignore */ }
  return headers;
}

async function callEndpoint(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  let data = null;
  try { data = await res.json(); } catch (_) { data = null; }
  if (res.status === 503) {
    const msg = data?.error || 'AI service unavailable. The OpenRouter API key may not be configured on the server.';
    const err = new Error(msg);
    err.code = 'NO_KEY';
    throw err;
  }
  if (!res.ok) {
    throw new Error(data?.errors?.[0]?.msg || data?.error || `Request failed (${res.status})`);
  }
  return data;
}

function ExportControls() {
  const [form, setForm] = useState({ product_description: '', eccn_number: '', destination_country: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noKey, setNoKey] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setNoKey(false); setResult(null);
    try {
      const data = await callEndpoint('/api/ai/export-controls', {
        product_description: form.product_description,
        eccn_number: form.eccn_number || undefined,
        destination_country: form.destination_country.toUpperCase()
      });
      setResult(data.export_controls);
    } catch (err) {
      if (err.code === 'NO_KEY') setNoKey(true);
      else setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      <label style={label}>Product Description *</label>
      <textarea style={textarea} value={form.product_description} required
        onChange={e => setForm(f => ({ ...f, product_description: e.target.value }))}
        placeholder="e.g. Industrial encryption module for telecom infrastructure" />

      <label style={label}>ECCN (optional)</label>
      <input style={input} value={form.eccn_number}
        onChange={e => setForm(f => ({ ...f, eccn_number: e.target.value }))}
        placeholder="e.g. 5A002" />

      <label style={label}>Destination Country (2-letter ISO) *</label>
      <input style={input} value={form.destination_country} required maxLength={2}
        onChange={e => setForm(f => ({ ...f, destination_country: e.target.value }))}
        placeholder="e.g. CN" />

      <button style={{ ...btn('#2563eb'), opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze Export Controls'}
      </button>

      {noKey && <div style={warnBox}>AI service unavailable — the server has no <code>OPENROUTER_API_KEY</code> configured. Set it and retry.</div>}
      {error && <div style={errorBox}>{error}</div>}
      {result && <pre style={{ ...resultBox, whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#0f172a' }}>{JSON.stringify(result, null, 2)}</pre>}
    </form>
  );
}

function CountryRisk() {
  const [form, setForm] = useState({ country_code: '', trade_purpose: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noKey, setNoKey] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setNoKey(false); setResult(null);
    try {
      const data = await callEndpoint('/api/ai/country-risk', {
        country_code: form.country_code.toUpperCase(),
        trade_purpose: form.trade_purpose
      });
      setResult(data.country_risk);
    } catch (err) {
      if (err.code === 'NO_KEY') setNoKey(true);
      else setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      <label style={label}>Country Code (2-letter ISO) *</label>
      <input style={input} value={form.country_code} required maxLength={2}
        onChange={e => setForm(f => ({ ...f, country_code: e.target.value }))}
        placeholder="e.g. RU" />

      <label style={label}>Trade Purpose *</label>
      <textarea style={textarea} value={form.trade_purpose} required
        onChange={e => setForm(f => ({ ...f, trade_purpose: e.target.value }))}
        placeholder="e.g. Importing consumer electronics for retail distribution" />

      <button style={{ ...btn('#7c3aed'), opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Assessing...' : 'Assess Country Risk'}
      </button>

      {noKey && <div style={warnBox}>AI service unavailable — the server has no <code>OPENROUTER_API_KEY</code> configured. Set it and retry.</div>}
      {error && <div style={errorBox}>{error}</div>}
      {result && <pre style={{ ...resultBox, whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#0f172a' }}>{JSON.stringify(result, null, 2)}</pre>}
    </form>
  );
}

function LandedCost() {
  const [productJson, setProductJson] = useState('{\n  "name": "Stainless steel water bottle",\n  "value_usd": 12.50\n}');
  const [origin, setOrigin] = useState('');
  const [destinations, setDestinations] = useState('US, DE, JP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noKey, setNoKey] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setNoKey(false); setResult(null);
    let product;
    try { product = JSON.parse(productJson); }
    catch (err) { setError('Product JSON is invalid: ' + err.message); setLoading(false); return; }

    const dests = destinations.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    try {
      const data = await callEndpoint('/api/ai/landed-cost-optimizer', {
        product, origin: origin.toUpperCase(), destinations: dests
      });
      setResult(data.landed_cost_analysis);
    } catch (err) {
      if (err.code === 'NO_KEY') setNoKey(true);
      else setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      <label style={label}>Product (JSON) *</label>
      <textarea style={{ ...textarea, fontFamily: 'monospace', minHeight: '120px' }} value={productJson} required
        onChange={e => setProductJson(e.target.value)} />

      <label style={label}>Origin Country (2-letter ISO) *</label>
      <input style={input} value={origin} required maxLength={2}
        onChange={e => setOrigin(e.target.value)} placeholder="e.g. CN" />

      <label style={label}>Destination Countries (comma-separated, 2-letter ISO) *</label>
      <input style={input} value={destinations} required
        onChange={e => setDestinations(e.target.value)} placeholder="US, DE, JP" />

      <button style={{ ...btn('#0891b2'), opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Comparing...' : 'Compare Landed Costs'}
      </button>

      {noKey && <div style={warnBox}>AI service unavailable — the server has no <code>OPENROUTER_API_KEY</code> configured. Set it and retry.</div>}
      {error && <div style={errorBox}>{error}</div>}
      {result && <pre style={{ ...resultBox, whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#0f172a' }}>{JSON.stringify(result, null, 2)}</pre>}
    </form>
  );
}

function BrokerInstruction() {
  const [shipmentId, setShipmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noKey, setNoKey] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setNoKey(false); setResult(null);
    try {
      const data = await callEndpoint('/api/ai/broker-instruction', { shipment_id: shipmentId });
      setResult(data.broker_instruction);
    } catch (err) {
      if (err.code === 'NO_KEY') setNoKey(true);
      else setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit}>
      <label style={label}>Shipment ID *</label>
      <input style={input} value={shipmentId} required
        onChange={e => setShipmentId(e.target.value)} placeholder="numeric id from the Shipments table" />

      <button style={{ ...btn('#dc2626'), opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
        {loading ? 'Generating...' : 'Generate Broker Instruction'}
      </button>

      {noKey && <div style={warnBox}>AI service unavailable — the server has no <code>OPENROUTER_API_KEY</code> configured. Set it and retry.</div>}
      {error && <div style={errorBox}>{error}</div>}
      {result && <pre style={{ ...resultBox, whiteSpace: 'pre-wrap', fontSize: '0.85rem', color: '#0f172a' }}>{JSON.stringify(result, null, 2)}</pre>}
    </form>
  );
}

export default function TradeTools() {
  const [active, setActive] = useState(TOOLS[0].key);
  const Tool = active === 'export-controls' ? ExportControls
             : active === 'country-risk' ? CountryRisk
             : active === 'landed-cost' ? LandedCost
             : BrokerInstruction;

  return (
    <div>
      <h1 style={h1}>Trade Tools</h1>
      <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>
        Export controls, country risk, landed cost, and broker instructions powered by AI.
      </p>
      <div style={tabsBar}>
        {TOOLS.map(t => (
          <button key={t.key} style={tab(active === t.key)} onClick={() => setActive(t.key)} type="button">
            {t.label}
          </button>
        ))}
      </div>
      <div style={card}>
        <Tool />
      </div>
    </div>
  );
}
