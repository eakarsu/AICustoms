import React, { useState } from 'react';

const card = { background: '#fff', borderRadius: '10px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', maxWidth: '700px' };
const label = { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' };
const input = {
  width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '6px',
  fontSize: '0.95rem', marginBottom: '1rem', outline: 'none'
};
const textarea = { ...input, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' };
const btn = {
  background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px',
  padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
};
const h1 = { fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a2340' };
const resultBox = { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '1.2rem', marginTop: '1.5rem' };

export default function Classify() {
  const [form, setForm] = useState({ product_name: '', description: '', material: '', intended_use: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.msg || data.error || 'Request failed');
      setResult(data.classification);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={h1}>HS Code Classification</h1>
      <div style={card}>
        <form onSubmit={handleSubmit}>
          <label style={label}>Product Name *</label>
          <input style={input} name="product_name" value={form.product_name} onChange={handleChange} placeholder="e.g. Stainless steel water bottle" required />

          <label style={label}>Description</label>
          <textarea style={textarea} name="description" value={form.description} onChange={handleChange} placeholder="Detailed product description..." />

          <label style={label}>Material</label>
          <input style={input} name="material" value={form.material} onChange={handleChange} placeholder="e.g. 304 stainless steel, BPA-free plastic" />

          <label style={label}>Intended Use</label>
          <input style={input} name="intended_use" value={form.intended_use} onChange={handleChange} placeholder="e.g. Consumer beverage container" />

          <button style={{ ...btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Classifying...' : 'Classify Product'}
          </button>
        </form>

        {error && <div style={{ color: '#ef4444', marginTop: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '6px' }}>{error}</div>}

        {result && (
          <div style={resultBox}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', color: '#0369a1' }}>Classification Result</h3>
            {result.hs_code && (
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.5rem', color: '#1a2340' }}>{result.hs_code}</span>
                {result.confidence && <span style={{ marginLeft: '1rem', color: '#64748b', fontSize: '0.9rem' }}>Confidence: {result.confidence}%</span>}
              </div>
            )}
            {result.description && <p style={{ marginBottom: '0.5rem', color: '#374151' }}><strong>Description:</strong> {result.description}</p>}
            {result.duty_rate_estimate && <p style={{ marginBottom: '0.5rem', color: '#374151' }}><strong>Estimated Duty Rate:</strong> {result.duty_rate_estimate}</p>}
            {result.reasoning && <p style={{ marginBottom: '0.75rem', color: '#374151' }}><strong>Reasoning:</strong> {result.reasoning}</p>}
            {result.alternative_codes?.length > 0 && (
              <div>
                <strong>Alternative Codes:</strong>
                <ul style={{ marginTop: '0.4rem', paddingLeft: '1.2rem' }}>
                  {result.alternative_codes.map((alt, i) => (
                    <li key={i} style={{ color: '#64748b', fontSize: '0.9rem' }}>{alt.code} — {alt.description}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.raw_response && (
              <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: '1rem', borderRadius: '6px', fontSize: '0.8rem', overflow: 'auto', marginTop: '0.5rem' }}>
                {result.raw_response}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
