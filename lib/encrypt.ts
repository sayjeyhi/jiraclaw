import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_KEY or BETTER_AUTH_SECRET must be set to encrypt API keys");
  }
  return scryptSync(secret, "jiraclaw-api-keys", KEY_LENGTH);
}

/**
 * Encrypts a string (e.g. API key) for storage.
 * Returns base64-encoded: iv:tag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

/**
 * Decrypts a string encrypted with encrypt().
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const buf = Buffer.from(ciphertext, "base64");
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = buf.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LENGTH,
  });
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final("utf8");
}
