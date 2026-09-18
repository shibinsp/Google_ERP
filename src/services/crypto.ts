/**
 * Client-Side End-to-End Encryption (E2EE) and Cryptographic Security Engine
 * Powered by W3C Web Crypto API (SubtleCrypto) - AES-GCM 256-bit
 */

// Enterprise derived master key seed
const MASTER_SALT = new TextEncoder().encode("ERP-ENTERPRISE-E2EE-SALT-v2026");

let cachedCryptoKey: CryptoKey | null = null;

/**
 * Derives a 256-bit AES-GCM encryption key using PBKDF2
 */
export async function getMasterKey(): Promise<CryptoKey> {
  if (cachedCryptoKey) return cachedCryptoKey;

  const basePassphrase = "enterprise-vault-master-root-key-2026";
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(basePassphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  cachedCryptoKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: MASTER_SALT,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return cachedCryptoKey;
}

/**
 * Encrypts arbitrary sensitive string (e.g. SSN, bank account, token) with AES-GCM
 * Returns formatted string: "E2EE-v1:<iv_b64>:<ciphertext_b64>"
 */
export async function encryptSensitiveData(plainText: string): Promise<string> {
  try {
    const key = await getMasterKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);

    const cipherBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encoded
    );

    const ivB64 = btoa(String.fromCharCode(...iv));
    const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));

    return `E2EE-AES256:${ivB64}:${cipherB64}`;
  } catch (err) {
    console.error("Encryption failure:", err);
    return `E2EE-ENC-ERR:${plainText.slice(0, 4)}***`;
  }
}

/**
 * Decrypts AES-GCM encrypted payload back to plaintext
 */
export async function decryptSensitiveData(encryptedPayload: string): Promise<string> {
  try {
    if (!encryptedPayload.startsWith("E2EE-AES256:")) {
      return "[Unrecognized Ciphertext]";
    }

    const [, ivB64, cipherB64] = encryptedPayload.split(":");
    const iv = new Uint8Array(
      atob(ivB64)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const cipherBytes = new Uint8Array(
      atob(cipherB64)
        .split("")
        .map((c) => c.charCodeAt(0))
    );

    const key = await getMasterKey();
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      cipherBytes
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.warn("Decryption unauthorized or key mismatch:", err);
    return "[DECRYPTION FAILED - RESTRICTED]";
  }
}

/**
 * Computes a deterministic SHA-256 hexadecimal hash for audit seal & integrity verification
 */
export async function computeSha256(data: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates a rolling 6-digit TOTP-style code for the current 30-second window
 */
export function getCurrentTotpCode(secretSeed = "ERP-CORP-MFA-2026"): { code: string; secondsRemaining: number } {
  const epochSeconds = Math.floor(Date.now() / 1000);
  const step = 30;
  const timeCounter = Math.floor(epochSeconds / step);
  const secondsRemaining = step - (epochSeconds % step);

  // Deterministic simulation hash for TOTP step
  let hash = 0;
  const keyStr = `${secretSeed}:${timeCounter}`;
  for (let i = 0; i < keyStr.length; i++) {
    hash = (hash * 31 + keyStr.charCodeAt(i)) & 0xffffffff;
  }
  const positiveHash = Math.abs(hash);
  const code = (positiveHash % 900000 + 100000).toString();

  return { code, secondsRemaining };
}
