import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { wasm } from '../services/api';
import { decryptPrivateKey } from '../services/keyCrypto';
import { useAuthStore } from '../hooks/useAuthStore';
import type { EncryptedBlob } from '../services/keyCrypto';

interface AuthInfo {
  auth_mode: string;
  encrypted_private_key?: string;
  salt?: string;
  iv?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [address, setAddress] = useState('');
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [password, setPassword] = useState('');
  const [privKey, setPrivKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!address.trim()) { setError('Address is required'); return; }
    setLoading(true);
    try {
      const result = await wasm.getAuthInfo(address.trim());
      if (result.error) { setError(result.error === 'not found' ? 'not_found' : result.error); return; }
      setAuthInfo(result as AuthInfo);
      setStep(2);
    } catch (e: any) { setError(e.message || 'Failed'); }
    finally { setLoading(false); }
  }

  async function handleLoginPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!authInfo) return;
    setLoading(true);
    try {
      const blob: EncryptedBlob = { ciphertext: authInfo.encrypted_private_key!, salt: authInfo.salt!, iv: authInfo.iv! };
      let pk: string;
      try { pk = await decryptPrivateKey(blob, password); }
      catch { setError('Incorrect password'); return; }
      const res = await wasm.importPrivateKey(pk);
      if (res.error) throw new Error(res.error);
      authStore.setAuth(address.trim(), 'password', pk, res.publicKey, blob);
      navigate('/');
    } catch (e: any) { setError(e.message || 'Login failed'); }
    finally { setLoading(false); }
  }

  async function handleLoginKey(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[0-9a-fA-F]{64}$/.test(privKey.trim())) { setError('Must be 64 hex characters'); return; }
    setLoading(true);
    try {
      const res = await wasm.importPrivateKey(privKey.trim());
      if (res.error) throw new Error(res.error);
      authStore.setAuth(address.trim(), 'key', privKey.trim(), res.publicKey);
      navigate('/');
    } catch (e: any) { setError(e.message || 'Login failed'); }
    finally { setLoading(false); }
  }

  const s = {
    page: { minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } as React.CSSProperties,
    left: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '48px', color: 'white' },
    right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
    card: { width: '100%', maxWidth: '420px', background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
    iconBox: { width: '64px', height: '64px', background: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', backdropFilter: 'blur(10px)' },
    input: { width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1f2937', outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
    btn: { width: '100%', background: '#00a884', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' },
    btnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
    label: { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' },
    error: { fontSize: '13px', color: '#ef4444', background: '#fef2f2', borderRadius: '8px', padding: '10px 12px' },
    h2: { fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' },
    sub: { fontSize: '14px', color: '#6b7280', marginBottom: '24px' },
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
        <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px' }}>EMSG</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', lineHeight: 1.6, maxWidth: '320px', textAlign: 'center' }}>
          Secure, decentralized messaging powered by Ed25519 cryptography.
        </p>
        <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['End-to-end encrypted', 'DNS-based routing', 'No central server', 'Open protocol'].map(f => (
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
          {step === 1 && (
            <>
              <h2 style={s.h2}>Welcome back</h2>
              <p style={s.sub}>Enter your EMSG address to continue</p>
              <form onSubmit={handleContinue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={s.label}>EMSG Address</label>
                  <input style={s.input} value={address} onChange={e => setAddress(e.target.value)}
                    placeholder="alice#example.com" spellCheck={false} autoFocus />
                </div>
                {error === 'not_found' ? (
                  <div style={s.error}>
                    Address not registered.{' '}
                    <Link to="/register" style={{ color: '#00a884', fontWeight: 600 }}>Register here</Link>
                  </div>
                ) : error ? <div style={s.error}>{error}</div> : null}
                <button type="submit" disabled={loading || !address.trim()}
                  style={{ ...s.btn, ...(loading || !address.trim() ? s.btnDisabled : {}) }}>
                  {loading ? 'Checking…' : 'Continue →'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                  No account?{' '}
                  <Link to="/register" style={{ color: '#00a884', fontWeight: 600 }}>Register</Link>
                </p>
              </form>
            </>
          )}

          {step === 2 && authInfo && (
            <>
              <button onClick={() => { setStep(1); setAuthInfo(null); setPassword(''); setPrivKey(''); setError(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', padding: 0 }}>
                <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: 'currentColor' }}>
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Back
              </button>
              <h2 style={s.h2}>{authInfo.auth_mode === 'password' ? 'Enter password' : 'Enter private key'}</h2>
              <p style={{ ...s.sub, fontFamily: 'monospace', fontSize: '12px' }}>{address}</p>

              {authInfo.auth_mode === 'password' && (
                <form onSubmit={handleLoginPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={s.label}>Password</label>
                    <input type="password" style={s.input} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoFocus />
                  </div>
                  {error && <div style={s.error}>{error}</div>}
                  <button type="submit" disabled={loading || !password}
                    style={{ ...s.btn, ...(loading || !password ? s.btnDisabled : {}) }}>
                    {loading ? 'Logging in…' : 'Login'}
                  </button>
                </form>
              )}

              {authInfo.auth_mode === 'key' && (
                <form onSubmit={handleLoginKey} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={s.label}>Private Key</label>
                    <input style={{ ...s.input, fontFamily: 'monospace' }} value={privKey}
                      onChange={e => setPrivKey(e.target.value)} placeholder="64-character hex key"
                      maxLength={64} spellCheck={false} autoFocus />
                  </div>
                  {error && <div style={s.error}>{error}</div>}
                  <button type="submit" disabled={loading || !privKey.trim()}
                    style={{ ...s.btn, ...(loading || !privKey.trim() ? s.btnDisabled : {}) }}>
                    {loading ? 'Logging in…' : 'Login'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
