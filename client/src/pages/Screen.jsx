import React, { useState } from 'react';

const card = { background: '#fff', borderRadius: '10px', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', maxWidth: '700px' };
const label = { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' };
const input = {
  width: '100%', padding: '0.65rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '6px',
  fontSize: '0.95rem', marginBottom: '1rem', outline: 'none'
};
const select = { ...input };
const btn = (color) => ({
  background: color, color: '#fff', border: 'none', borderRadius: '6px',
  padding: '0.65rem 1.5rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', marginRight: '0.75rem'
});
const h1 = { fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a2340' };
const riskColor = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' };
const badge = (level) => ({
  background: riskColor[level] || '#64748b', color: '#fff',
  padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem'
});

export default function Screen() {
  const [form, setForm] = useState({ entity_name: '', entity_type: 'Company', country: '' });
  const [complianceResult, setComplianceResult] = useState(null);
  const [sanctionsResult, setSanctionsResult] = useState(null);
  const [loading, setLoading] = useState({ compliance: false, sanctions: false });
  const [error, setError] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const screen = async (type) => {
    setLoading(l => ({ ...l, [type]: true }));
    setError(null);
    if (type === 'compliance') setComplianceResult(null);
    else setSanctionsResult(null);

    try {
      const endpoint = type === 'compliance' ? '/api/ai/screen-compliance' : '/api/ai/screen-sanctions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.msg || data.error || 'Request failed');
      if (type === 'compliance') setComplianceResult(data.screening);
      else setSanctionsResult(data.sanctions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(l => ({ ...l, [type]: false }));
    }
  };

  const ResultSection = ({ title, result, type }) => {
    if (!result) return null;
    const riskLevel = result.risk_level || (result.risk_score >= 70 ? 'high' : result.risk_score >= 40 ? 'medium' : 'low');
    return (
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.2rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontWeight: 700, color: '#1a2340' }}>{title}</h3>
          <span style={badge(riskLevel)}>{riskLevel?.toUpperCase() || 'UNKNOWN'}</span>
        </div>
        {result.summary && <p style={{ color: '#374151', marginBottom: '0.5rem' }}>{result.summary}</p>}
        {result.match_found !== undefined && (
          <p style={{ color: '#374151', marginBottom: '0.25rem' }}>
            <strong>Match Found:</strong> {result.match_found ? 'Yes' : 'No'}
            {result.match_score != null && ` (Score: ${result.match_score}/100)`}
          </p>
        )}
        {result.risk_score != null && (
          <p style={{ color: '#374151', marginBottom: '0.25rem' }}><strong>Risk Score:</strong> {result.risk_score}/100</p>
        )}
        {result.sanctions_status && (
          <p style={{ color: '#374151', marginBottom: '0.25rem' }}><strong>Sanctions Status:</strong> {result.sanctions_status}</p>
        )}
        {result.embargo_status && (
          <p style={{ color: '#374151', marginBottom: '0.5rem' }}><strong>Embargo Status:</strong> {result.embargo_status}</p>
        )}
        {result.recommendations && (
          <div style={{ marginTop: '0.5rem' }}>
            <strong>Recommendations:</strong>
            <p style={{ color: '#64748b', marginTop: '0.25rem' }}>{
              Array.isArray(result.recommendations) ? result.recommendations.join('; ') : result.recommendations
            }</p>
          </div>
        )}
        {result.screening_results?.length > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <strong>Lists Checked:</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
              {result.screening_results.map((r, i) => (
                <li key={i} style={{ color: '#64748b', fontSize: '0.9rem' }}>{r.list_name}: {r.match_type} — {r.details}</li>
              ))}
            </ul>
          </div>
        )}
        {result.raw_response && (
          <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: '1rem', borderRadius: '6px', fontSize: '0.8rem', overflow: 'auto', marginTop: '0.75rem' }}>
            {result.raw_response}
          </pre>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 style={h1}>Compliance & Sanctions Screening</h1>
      <div style={card}>
        <label style={label}>Entity Name *</label>
        <input style={input} name="entity_name" value={form.entity_name} onChange={handleChange} placeholder="Company or individual name" />

        <label style={label}>Entity Type</label>
        <select style={select} name="entity_type" value={form.entity_type} onChange={handleChange}>
          <option>Company</option>
          <option>Individual</option>
          <option>Organization</option>
          <option>Government Entity</option>
        </select>

        <label style={label}>Country (2-letter ISO)</label>
        <input style={input} name="country" value={form.country} onChange={handleChange} placeholder="e.g. RU, CN, IR" maxLength={2} />

        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '6px' }}>{error}</div>}

        <div>
          <button style={{ ...btn('#2563eb'), opacity: loading.compliance ? 0.7 : 1 }} onClick={() => screen('compliance')} disabled={loading.compliance || !form.entity_name}>
            {loading.compliance ? 'Screening...' : 'Compliance Screen'}
          </button>
          <button style={{ ...btn('#7c3aed'), opacity: loading.sanctions ? 0.7 : 1 }} onClick={() => screen('sanctions')} disabled={loading.sanctions || !form.entity_name}>
            {loading.sanctions ? 'Screening...' : 'Sanctions Screen'}
          </button>
        </div>

        <ResultSection title="Compliance Screening Result" result={complianceResult} type="compliance" />
        <ResultSection title="Sanctions Screening Result" result={sanctionsResult} type="sanctions" />
      </div>
    </div>
  );
}
