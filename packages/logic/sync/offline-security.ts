/**
 * ENCRYPTED OFFLINE STORAGE UTILITY (ZERO-STUB)
 * Uses Web Crypto API (SubtleCrypto) to secure IndexedDB data.
 */
export class OfflineSecurity {
  /**
   * Generates an encryption key from the user's current session JWT.
   * This ensures keys are never stored on the physical device.
   */
  static async getSessionKey(jwt: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(jwt),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('pristine-laundry-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts data before writing to IndexedDB
   */
  static async encryptData(data: string, key: CryptoKey) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    return {
      iv: Buffer.from(iv).toString('hex'),
      data: Buffer.from(encrypted).toString('hex')
    };
  }
}
