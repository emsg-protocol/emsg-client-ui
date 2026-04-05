import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { wasm } from '../services/api';
import { encryptPrivateKey, validatePassword } from '../services/keyCrypto';
import { useAuthStore } from '../hooks/useAuthStore';

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [address, setAddress] = useState('');
  const [authMode, setAuthMode] = useState<'password' | 'key'>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savedKeyConfirmed, setSavedKeyConfirmed] = useState(false);
  const [generatedPrivKey, setGeneratedPrivKey] = useState('');
  const [generatedPubKey, setGeneratedPubKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateKeys() {
    const res = await wasm.generateKeyPair();
    if (res.error) throw new Error(res.error);
    setGeneratedPrivKey(res.privateKey);
    setGeneratedPubKey(res.publicKey);
  }

  useEffect(() => { generateKeys().catch(e => setError(e.message)); }, []);
  useEffect(() => { if (authMode === 'key') generateKeys().catch(e => setError(e.message)); }, [authMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!address.trim()) { setError('Address is required'); return; }
    if (authMode === 'password') {
      const pwError = validatePassword(password);
      if (pwError) { setError(pwError); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    }
    setLoading(true);
    try {
      if (authMode === 'password') {
        const blob = await encryptPrivateKey(generatedPrivKey, password);
        const res = await wasm.registerUser(address.trim(), generatedPubKey, 'password', blob.ciphertext, blob.salt, blob.iv);
        if (res.error) throw new Error(res.error.toLowerCase().includes('already') ? 'This address is already registered' : res.error);
        setAuth(address.trim(), 'password', generatedPrivKey, generatedPubKey, blob);
      } else {
        const res = await wasm.registerUser(address.trim(), generatedPubKey, 'key');
        if (res.error) throw new Error(res.error.toLowerCase().includes('already') ? 'This address is already registered' : res.error);
        setAuth(address.trim(), 'key', generatedPrivKey, generatedPubKey);
      }
      navigate('/');
    } catch (e: any) { setError(e.message || 'Registration failed'); }
    finally { setLoading(false); }
  }

  const s = {
    page: { minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } as React.CSSProperties,
    left: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '48px', color: 'white' },
    right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
    card: { width: '100%', maxWidth: '420px', background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
    iconBox: { width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', backdropFilter: 'blur(10px)' },
    input: { width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1f2937', outline: 'none', boxSizing: 'border-box' as const },
    btn: { width: '100%', background: '#00a884', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
    btnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
    label: { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' } as React.CSSProperties,
    error: { fontSize: '13px', color: '#ef4444', background: '#fef2f2', borderRadius: '8px', padding: '10px 12px' },
    h2: { fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' },
    sub: { fontSize: '14px', color: '#6b7280', marginBottom: '24px' },
    modeBtn: (active: boolean) => ({
      flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
      background: active ? '#00a884' : 'white', color: active ? 'white' : '#6b7280', transition: 'all 0.2s',
    }),
  };

  return (
    <div style={s.page}>
      {/* Left */}
      <div style={s.left}>
        <div style={s.iconBox}>
          <svg viewBox="0 0 24 24" style={{ width: 32, height: 32, fill: 'white' }}>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px' }}>Join EMSG</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', lineHeight: 1.6, maxWidth: '320px', textAlign: 'center' }}>
          Create your account and start messaging securely.
        </p>
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['Password mode: login from any device', 'Key mode: full custody of your identity', 'No email or phone required', 'Open source protocol'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.75)', fontSize: '14px' }}>
              <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: '#86efac', flexShrink: 0 }}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.h2}>Create account</h2>
          <p style={s.sub}>Choose how you want to manage your identity</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={s.label}>EMSG Address</label>
              <input style={s.input} value={address} onChange={e => setAddress(e.target.value)}
                placeholder="alice#example.com" spellCheck={false} disabled={loading} />
            </div>

            <div>
              <label style={s.label}>Authentication mode</label>
              <div style={{ display: 'flex', border: '1.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                <button type="button" style={s.modeBtn(authMode === 'password')}
                  onClick={() => { setAuthMode('password'); setError(null); }} disabled={loading}>
                  🔑 Password
                </button>
                <button type="button" style={s.modeBtn(authMode === 'key')}
                  onClick={() => { setAuthMode('key'); setError(null); setSavedKeyConfirmed(false); }} disabled={loading}>
                  🗝️ Raw Key
                </button>
              </div>
            </div>

            {authMode === 'password' && (
              <>
                <div>
                  <label style={s.label}>Password <span style={{ color: '#9ca3af', fontWeight: 400 }}>(min 12 chars)</span></label>
                  <input type="password" style={s.input} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" disabled={loading} />
                </div>
                <div>
                  <label style={s.label}>Confirm password</label>
                  <input type="password" style={s.input} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat your password" disabled={loading} />
                </div>
              </>
            )}

            {authMode === 'key' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, marginBottom: '4px' }}>Public key</p>
                  <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#374151', wordBreak: 'break-all' }}>{generatedPubKey || 'Generating…'}</p>
                </div>
                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ fontSize: '11px', color: '#92400e', fontWeight: 600, marginBottom: '4px' }}>⚠️ Private key — save this now</p>
                  <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#374151', wordBreak: 'break-all' }}>{generatedPrivKey || 'Generating…'}</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={savedKeyConfirmed}
                    onChange={e => setSavedKeyConfirmed(e.target.checked)} disabled={loading}
                    style={{ width: '16px', height: '16px', accentColor: '#00a884' }} />
                  <span style={{ fontSize: '13px', color: '#374151' }}>I have saved my private key securely</span>
                </label>
              </div>
            )}

            {error && <div style={s.error}>{error}</div>}

            <button type="submit"
              disabled={loading || (authMode === 'key' && !savedKeyConfirmed)}
              style={{ ...s.btn, ...(loading || (authMode === 'key' && !savedKeyConfirmed) ? s.btnDisabled : {}) }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#00a884', fontWeight: 600 }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
