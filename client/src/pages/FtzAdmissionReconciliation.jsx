import React, { useEffect, useState } from 'react';
import FormattedAIReport from '../components/FormattedAIReport';

export default function FtzAdmissionReconciliation() {
  const [data, setData] = useState({ summary: {}, admissions: [] });
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/ftz-admission-reconciliation')
      .then((res) => { if (!res.ok) throw new Error('Admissions could not be loaded'); return res.json(); })
      .then((payload) => {
        if (!Array.isArray(payload?.admissions)) throw new Error('Admissions response must contain an array.');
        setData({ summary: payload?.summary && typeof payload.summary === 'object' ? payload.summary : {}, admissions: payload.admissions });
      })
      .catch((failure) => setError(failure.message));
  }, []);

  const reconcile = async (admissionId) => {
    const res = await fetch('/api/ftz-admission-reconciliation/reconcile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admissionId }),
    });
    setResult(await res.json());
  };

  return (
    <div>
      <h1>FTZ Admission Reconciliation</h1>
      <p>Match foreign-trade zone admissions against withdrawals, duty status, and CBP support documents.</p>
      {error && <p role="alert">{error}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, margin: '20px 0' }}>
        {Object.entries(data.summary).map(([key, value]) => (
          <div key={key} style={{ border: '1px solid #dbe3ef', borderRadius: 8, padding: 16 }}>
            <div style={{ color: '#64748b', fontSize: 13 }}>{key}</div>
            <strong style={{ fontSize: 28 }}>{value}</strong>
          </div>
        ))}
      </div>
      {data.admissions.map((item) => (
        <div key={item.id} style={{ border: '1px solid #dbe3ef', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <strong>{item.id}</strong> · {item.zone} · {item.sku}
          <div>Admitted {item.admittedQty}, withdrawn {item.withdrawnQty}, variance {item.variance}</div>
          <button onClick={() => reconcile(item.id)} style={{ marginTop: 8 }}>Reconcile</button>
        </div>
      ))}
      {result && <FormattedAIReport response={result} title="Admission reconciliation" />}
    </div>
  );
}
