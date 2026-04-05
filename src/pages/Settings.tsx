import React, { useState } from 'react';
import { useAuthStore } from '../hooks/useAuthStore';
import { encryptPrivateKey, decryptPrivateKey, validatePassword } from '../services/keyCrypto';
import { wasm } from '../services/api';

// ─── Change Password (Mode A only) ───────────────────────────────────────────

function ChangePasswordSection() {
  const { address, authMode, privateKey, publicKey, encryptedBlob, setAuth } = useAuthStore();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authMode !== 'password') return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const pwError = validatePassword(newPw);
    if (pwError) { setError(pwError); return; }
    if (newPw !== confirmPw) { setError('New passwords do not match'); return; }

    setLoading(true);
    try {
      await decryptPrivateKey(encryptedBlob!, currentPw);
    } catch {
      setError('Current password is incorrect');
      setLoading(false);
      return;
    }

    try {
      const newBlob = await encryptPrivateKey(privateKey!, newPw);
      const result = await wasm.updateEncryptedKey(address!, 'password', newBlob.ciphertext, newBlob.salt, newBlob.iv);
      if (result?.error) throw new Error(result.error);
      setAuth(address!, 'password', privateKey!, publicKey!, newBlob);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Current Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100"
            value={currentPw}
            onChange={e => setCurrentPw(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Password changed successfully.</div>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Updating…' : 'Change Password'}
        </button>
      </form>
    </section>
  );
}

// ─── Switch to Key Mode (Mode A only) ────────────────────────────────────────

function SwitchToKeyModeSection() {
  const { address, authMode, publicKey, encryptedBlob, setAuth } = useAuthStore();
  const [currentPw, setCurrentPw] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (authMode !== 'password') return null;

  async function handleDecrypt(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const key = await decryptPrivateKey(encryptedBlob!, currentPw);
      setRevealedKey(key);
    } catch {
      setError('Current password is incorrect');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmSwitch() {
    if (!revealedKey) return;
    setLoading(true);
    try {
      const result = await wasm.updateEncryptedKey(address!, 'key', '', '', '');
      if (result?.error) throw new Error(result.error);
      setAuth(address!, 'key', revealedKey, publicKey!);
      setRevealedKey(null);
      setCurrentPw('');
      setConfirmed(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to switch mode');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-8 p-4 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
      <h3 className="text-lg font-semibold mb-3">Switch to Key Mode</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Switch to raw-key authentication. You will need to save your private key manually.
      </p>
      {!revealedKey ? (
        <form onSubmit={handleDecrypt} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100"
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Reveal Private Key'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded">
            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">⚠️ Your Private Key — save it now!</p>
            <p className="break-all text-xs font-mono text-red-800 dark:text-red-200">{revealedKey}</p>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
            />
            I have saved my private key in a secure location
          </label>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            onClick={handleConfirmSwitch}
            disabled={!confirmed || loading}
            className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50"
          >
            {loading ? 'Switching…' : 'Confirm Switch to Key Mode'}
          </button>
        </div>
      )}
    </section>
  );
}

// ─── Switch to Password Mode (Mode B only) ───────────────────────────────────

function SwitchToPasswordModeSection() {
  const { address, authMode, privateKey, publicKey, setAuth } = useAuthStore();
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (authMode !== 'key') return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const pwError = validatePassword(newPw);
    if (pwError) { setError(pwError); return; }
    if (newPw !== confirmPw) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      const blob = await encryptPrivateKey(privateKey!, newPw);
      const result = await wasm.updateEncryptedKey(address!, 'password', blob.ciphertext, blob.salt, blob.iv);
      if (result?.error) throw new Error(result.error);
      setAuth(address!, 'password', privateKey!, publicKey!, blob);
      setNewPw('');
      setConfirmPw('');
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to switch mode');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-8 p-4 border border-blue-200 dark:border-blue-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Switch to Password Mode</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Encrypt your private key with a password so you can log in from any device.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Switched to password mode successfully.</div>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Switching…' : 'Switch to Password Mode'}
        </button>
      </form>
    </section>
  );
}

// ─── Export Private Key (all users) ──────────────────────────────────────────

function ExportPrivateKeySection() {
  const { authMode, privateKey, encryptedBlob } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleDismiss() {
    setRevealedKey(null);
    setShowConfirm(false);
    setPassword('');
    setError(null);
    setCopied(false);
  }

  async function handleConfirm() {
    setError(null);
    if (authMode === 'password') {
      setLoading(true);
      try {
        const key = await decryptPrivateKey(encryptedBlob!, password);
        setRevealedKey(key);
      } catch {
        setError('Incorrect password');
      } finally {
        setLoading(false);
      }
    } else {
      setRevealedKey(privateKey);
    }
  }

  function handleCopy() {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Export Private Key</h3>
      {!showConfirm && !revealedKey && (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700"
          type="button"
        >
          Export Private Key
        </button>
      )}

      {showConfirm && !revealedKey && (
        <div className="space-y-3">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded text-sm text-orange-800 dark:text-orange-200">
            ⚠️ <strong>Security Warning:</strong> Your private key grants full access to your EMSG identity and messages.
            Never share it with anyone. Make sure no one can see your screen.
          </div>
          {authMode === 'password' && (
            <div>
              <label className="block text-sm font-medium mb-1">Enter your password to continue</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={loading || (authMode === 'password' && !password)}
              className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
              type="button"
            >
              {loading ? 'Verifying…' : 'Show Key'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {revealedKey && (
        <div className="space-y-3">
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded">
            <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Private Key:</p>
            <p className="break-all text-xs font-mono text-red-800 dark:text-red-200">{revealedKey}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
              type="button"
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
              type="button"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function Settings() {
  const { privateKey, publicKey } = useAuthStore();
  const [domain, setDomain] = useState(() => localStorage.getItem('emsg_domain') || 'emsg');

  function handleDomainChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDomain(e.target.value);
  }

  function handleSaveDomain(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem('emsg_domain', domain);
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-6">⚙️ Settings Panel</h2>

      {/* Domain */}
      <section className="mb-8">
        <form onSubmit={handleSaveDomain}>
          <label className="block font-medium mb-1">Domain:</label>
          <input
            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-800 dark:text-gray-100 mb-2"
            value={domain}
            onChange={handleDomainChange}
            placeholder="e.g. emsg, example.com"
          />
          <button
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            type="submit"
          >
            Save Domain
          </button>
        </form>
      </section>

      {/* Keys display */}
      <section className="mb-8">
        <div className="font-medium mb-1">Public Key:</div>
        <div className="break-all text-blue-700 dark:text-blue-300 text-xs mb-2">
          {publicKey || <span className="text-gray-400">No key loaded</span>}
        </div>
        <div className="font-medium mb-1">Private Key:</div>
        <div className="break-all text-red-700 dark:text-red-300 text-xs mb-2">
          {privateKey || <span className="text-gray-400">No key loaded</span>}
        </div>
      </section>

      <hr className="border-gray-200 dark:border-gray-700 mb-8" />

      {/* Section 1: Change Password (Mode A only) */}
      <ChangePasswordSection />

      {/* Section 2: Switch to Key Mode (Mode A only) */}
      <SwitchToKeyModeSection />

      {/* Section 3: Switch to Password Mode (Mode B only) */}
      <SwitchToPasswordModeSection />

      {/* Section 4: Export Private Key (all users) */}
      <ExportPrivateKeySection />

      <div className="text-xs text-gray-400 mt-4">
        Keep your private key secure. Anyone with your private key can access your messages.
      </div>
    </div>
  );
}
