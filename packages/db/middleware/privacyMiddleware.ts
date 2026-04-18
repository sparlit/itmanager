import { Prisma } from '@prisma/client';
import crypto from 'crypto';

/**
 * QATAR PRIVACY LAW COMPLIANCE MIDDLEWARE (FOSS)
 * Implements Field-Level Encryption for PII (Personally Identifiable Information).
 */
const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || '32-character-secret-key-for-encryption'; // Must be 32 bytes
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * Prisma Middleware to intercept read/write and handle encryption.
 * Targets fields like 'phone', 'email', 'unitNumber', 'landmark'.
 */
export const privacyMiddleware: Prisma.Middleware = async (params, next) => {
  // 1. ENCRYPT ON WRITE
  if (params.action === 'create' || params.action === 'update') {
    const data = params.args.data;
    if (data.phone) data.phone = encrypt(data.phone);
    if (data.email) data.email = encrypt(data.email);
    // Address fields
    if (data.unitNumber) data.unitNumber = encrypt(data.unitNumber);
    if (data.landmark) data.landmark = encrypt(data.landmark);
  }

  const result = await next(params);

  // 2. DECRYPT ON READ
  if (result) {
    const decryptObject = (obj: any) => {
      if (obj.phone && obj.phone.includes(':')) obj.phone = decrypt(obj.phone);
      if (obj.email && obj.email.includes(':')) obj.email = decrypt(obj.email);
      if (obj.unitNumber && obj.unitNumber.includes(':')) obj.unitNumber = decrypt(obj.unitNumber);
      if (obj.landmark && obj.landmark.includes(':')) obj.landmark = decrypt(obj.landmark);
    };

    if (Array.isArray(result)) {
      result.forEach(decryptObject);
    } else {
      decryptObject(result);
    }
  }

  return result;
};
