import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function fillDemoCredentials() {
    setError('');
    try {
      const response = await fetch('/api/auth/demo-credentials', { cache: 'no-store' });
      const credentials = await response.json();
      if (!response.ok) throw new Error(credentials.error || 'Demo credentials are unavailable');
      setEmail(credentials.email);
      setPassword(credentials.password);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', color: '#e2e8f0' }}>
      <form onSubmit={submit} style={{ width: 380, padding: 32, borderRadius: 16, background: '#1a2340', boxShadow: '0 20px 60px rgba(0,0,0,.35)' }}>
        <h1 style={{ marginTop: 0 }}>AI Customs</h1>
        <p style={{ color: '#94a3b8' }}>Sign in to the governed trade operations workspace.</p>
        {error && <div role="alert" style={{ marginBottom: 16, color: '#fecaca' }}>{error}</div>}
        <label style={{ display: 'block', marginBottom: 14 }}>
          Email
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} style={{ display: 'block', boxSizing: 'border-box', width: '100%', marginTop: 6, padding: 12 }} />
        </label>
        <label style={{ display: 'block', marginBottom: 18 }}>
          Password
          <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} style={{ display: 'block', boxSizing: 'border-box', width: '100%', marginTop: 6, padding: 12 }} />
        </label>
        <button type="button" onClick={fillDemoCredentials} style={{ width: '100%', padding: 11, marginBottom: 12 }}>
          Auto Fill Demo Credentials
        </button>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#2563eb', color: 'white', border: 0, borderRadius: 6 }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </main>
  );
}
