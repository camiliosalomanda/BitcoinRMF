/**
 * Data Encryption Utilities
 * Provides encryption/decryption for sensitive data at rest
 * 
 * Uses AES-256-GCM for authenticated encryption
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Derive encryption key from password/secret
 */
function deriveKey(secret: string, salt: Buffer): Buffer {
  return scryptSync(secret, salt, KEY_LENGTH);
}

/**
 * Get encryption secret from environment
 */
function getEncryptionSecret(): string {
  const secret = process.env.ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET or NEXTAUTH_SECRET must be set');
  }
  return secret;
}

/**
 * Encrypt sensitive data
 * Returns base64 encoded string: salt:iv:authTag:ciphertext
 */
export function encrypt(plaintext: string): string {
  const secret = getEncryptionSecret();
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(secret, salt);
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Combine: salt:iv:authTag:ciphertext
  return [
    salt.toString('base64'),
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted,
  ].join(':');
}

/**
 * Decrypt sensitive data
 * Expects base64 encoded string: salt:iv:authTag:ciphertext
 */
export function decrypt(encryptedData: string): string {
  const secret = getEncryptionSecret();
  
  const parts = encryptedData.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }
  
  const [saltB64, ivB64, authTagB64, ciphertext] = parts;
  
  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  
  const key = deriveKey(secret, salt);
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Hash sensitive data (one-way, for comparison)
 * Uses scrypt for password-like data
 */
export function hashSensitive(data: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = scryptSync(data, salt, 64);
  return `${salt.toString('base64')}:${hash.toString('base64')}`;
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, hashedData: string): boolean {
  const [saltB64, hashB64] = hashedData.split(':');
  if (!saltB64 || !hashB64) return false;
  
  const salt = Buffer.from(saltB64, 'base64');
  const expectedHash = Buffer.from(hashB64, 'base64');
  const actualHash = scryptSync(data, salt, 64);
  
  return actualHash.equals(expectedHash);
}

/**
 * Encrypt object (serializes to JSON first)
 */
export function encryptObject<T extends object>(obj: T): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt to object
 */
export function decryptObject<T extends object>(encryptedData: string): T {
  const json = decrypt(encryptedData);
  return JSON.parse(json) as T;
}

/**
 * Mask sensitive data for logging/display
 * Shows first and last few characters
 */
export function maskSensitive(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  
  const start = data.slice(0, visibleChars);
  const end = data.slice(-visibleChars);
  const masked = '*'.repeat(Math.min(data.length - visibleChars * 2, 8));
  
  return `${start}${masked}${end}`;
}

/**
 * Redact PII from text (emails, phone numbers, SSN patterns)
 */
export function redactPII(text: string): string {
  return text
    // Email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]')
    // Phone numbers (various formats)
    .replace(/(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[PHONE REDACTED]')
    // SSN
    .replace(/\d{3}[-\s]?\d{2}[-\s]?\d{4}/g, '[SSN REDACTED]')
    // Credit card numbers
    .replace(/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g, '[CARD REDACTED]');
}
