import React, { useEffect, useState } from 'react';

const card = { background: '#fff', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: '1.5rem' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' };
const statCard = (color) => ({
  background: color, borderRadius: '10px', padding: '1.2rem', color: '#fff'
});
const h1 = { fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1a2340' };
const badge = (level) => {
  const colors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed', pending: '#64748b', pass: '#22c55e', fail: '#ef4444' };
  return { background: colors[level] || '#64748b', color: '#fff', padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 };
};

export default function Dashboard() {
  const [shipments, setShipments] = useState({ data: [], pagination: {} });
  const [screenings, setScreenings] = useState({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/shipments?limit=5').then(r => r.json()),
      fetch('/api/compliance?limit=10').then(r => r.json())
    ]).then(([s, c]) => {
      setShipments(s);
      setScreenings(c);
      setLoading(false);
    }).catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#ef4444' }}>Error: {error}</div>;

  const total = shipments.pagination?.total || 0;
  const totalScreenings = screenings.pagination?.total || 0;
  const highRisk = (screenings.data || []).filter(s => s.risk_level === 'high' || s.risk_level === 'critical').length;
  const pending = (screenings.data || []).filter(s => s.status === 'pending').length;

  return (
    <div>
      <h1 style={h1}>Compliance Dashboard</h1>

      <div style={grid}>
        <div style={statCard('#2563eb')}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{total}</div>
          <div style={{ opacity: 0.85, marginTop: '0.25rem' }}>Total Shipments</div>
        </div>
        <div style={statCard('#0891b2')}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalScreenings}</div>
          <div style={{ opacity: 0.85, marginTop: '0.25rem' }}>Screenings</div>
        </div>
        <div style={statCard('#dc2626')}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{highRisk}</div>
          <div style={{ opacity: 0.85, marginTop: '0.25rem' }}>High Risk</div>
        </div>
        <div style={statCard('#d97706')}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{pending}</div>
          <div style={{ opacity: 0.85, marginTop: '0.25rem' }}>Pending Review</div>
        </div>
      </div>

      <div style={card}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#1a2340' }}>Recent Shipments</h2>
        {(shipments.data || []).length === 0 ? (
          <p style={{ color: '#64748b' }}>No shipments yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Tracking', 'Origin', 'Destination', 'Consignee', 'Value', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.5rem', color: '#64748b', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(shipments.data || []).map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.6rem 0.5rem' }}>{s.tracking_number || '—'}</td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>{s.origin_country}</td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>{s.destination_country}</td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>{s.consignee || '—'}</td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>{s.declared_value ? `${s.currency || 'USD'} ${Number(s.declared_value).toLocaleString()}` : '—'}</td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>
                    <span style={badge(s.compliance_status)}>{s.compliance_status || 'N/A'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a2340' }}>Recent Compliance Screenings</h2>
          <a href="/api/compliance/export" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem' }}>Export CSV</a>
        </div>
        {(screenings.data || []).length === 0 ? (
          <p style={{ color: '#64748b' }}>No screenings yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {['Entity', 'Type', 'Country', 'Risk Level', 'Status', 'Score'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.5rem', color: '#64748b', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(screenings.data || []).map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.6rem 0.5rem', fontWeight: 500 }}>{s.entity_name}</td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>{s.entity_type || '—'}</td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>{s.country || '—'}</td>
                  <td style={{ padding: '0.6rem 0.5rem' }}><span style={badge(s.risk_level)}>{s.risk_level || 'N/A'}</span></td>
                  <td style={{ padding: '0.6rem 0.5rem' }}><span style={badge(s.status)}>{s.status || 'N/A'}</span></td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>{s.match_score != null ? `${s.match_score}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
