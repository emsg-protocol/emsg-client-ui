export interface EncryptedBlob {
  ciphertext: string; // base64
  salt: string;       // base64, 16 bytes
  iv: string;         // base64, 12 bytes
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptPrivateKey(
  privateKeyHex: string,
  password: string
): Promise<EncryptedBlob> {
  const salt = new Uint8Array(16);
  const iv = new Uint8Array(12);
  window.crypto.getRandomValues(salt);
  window.crypto.getRandomValues(iv);

  const key = await deriveKey(password, salt);

  const enc = new TextEncoder();
  const plaintext = enc.encode(privateKeyHex);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  return {
    ciphertext: uint8ToBase64(new Uint8Array(ciphertextBuffer)),
    salt: uint8ToBase64(salt),
    iv: uint8ToBase64(iv),
  };
}

export async function decryptPrivateKey(
  blob: EncryptedBlob,
  password: string
): Promise<string> {
  try {
    const salt = base64ToUint8(blob.salt);
    const iv = base64ToUint8(blob.iv);
    const ciphertext = base64ToUint8(blob.ciphertext);

    const key = await deriveKey(password, salt);

    const plaintextBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(plaintextBuffer);
  } catch {
    throw new Error('Decryption failed: incorrect password');
  }
}

export function validatePassword(password: string): string | null {
  if (password.length >= 12) {
    return null;
  }
  return 'Password must be at least 12 characters';
}
