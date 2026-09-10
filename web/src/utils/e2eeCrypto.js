// =============================================================================
// Zero-Knowledge Client-Side End-to-End Encryption (E2EE) Engine
// Standard Web Crypto API: AES-GCM-256 with PBKDF2 (100,000 rounds)
// =============================================================================

const ENVELOPE_PREFIX = 'E2EE:v1:';
const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH_BITS = 256;

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Derives a 256-bit AES-GCM key from a user passcode and salt using PBKDF2
 */
async function deriveKey(passcode, saltBuffer) {
  const encoder = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passcode),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: KEY_LENGTH_BITS },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Checks if a string is an E2EE encrypted ciphertext envelope
 */
export function isE2EEEncrypted(text) {
  return typeof text === 'string' && text.startsWith(ENVELOPE_PREFIX);
}

/**
 * Encrypts plaintext on the client using AES-GCM-256 and recipient/sender passcode
 * Output format: E2EE:v1:<salt_hex>:<iv_hex>:<ciphertext_hex>
 */
export async function encryptE2EE(plainText, passcode) {
  if (!plainText) return '';
  if (!passcode) return plainText;

  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit standard for AES-GCM

    const key = await deriveKey(passcode, salt.buffer);
    const encoder = new TextEncoder();
    const encodedPlain = encoder.encode(plainText);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedPlain
    );

    const saltHex = bufferToHex(salt.buffer);
    const ivHex = bufferToHex(iv.buffer);
    const cipherHex = bufferToHex(encryptedBuffer);

    return `${ENVELOPE_PREFIX}${saltHex}:${ivHex}:${cipherHex}`;
  } catch (err) {
    console.error('E2EE Encryption failure:', err);
    throw new Error('Failed to encrypt message on client');
  }
}

/**
 * Decrypts an E2EE ciphertext envelope on the client with the provided passcode
 * Throws or returns null if passcode is incorrect or payload corrupted
 */
export async function decryptE2EE(envelope, passcode) {
  if (!envelope || !isE2EEEncrypted(envelope)) {
    return envelope; // Not an E2EE envelope, return raw
  }
  if (!passcode) {
    throw new Error('Passcode required to decrypt');
  }

  try {
    const body = envelope.substring(ENVELOPE_PREFIX.length);
    const parts = body.split(':');
    if (parts.length !== 3) {
      throw new Error('Malformed E2EE envelope');
    }

    const [saltHex, ivHex, cipherHex] = parts;
    const saltBuffer = hexToBuffer(saltHex);
    const ivBuffer = hexToBuffer(ivHex);
    const cipherBuffer = hexToBuffer(cipherHex);

    const key = await deriveKey(passcode, saltBuffer);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(ivBuffer)
      },
      key,
      cipherBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    // Decryption fails with OperationError when passcode or auth tag fails
    return null;
  }
}
