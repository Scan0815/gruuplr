import { base64ToArrayBuffer } from '../../utilities/Buffer';

/**
 * WebCryptoService encapsulates AES-GCM encryption and decryption using the browser's native SubtleCrypto API.
 */
export class WebCryptoService {


  static generateKey(): ArrayBuffer {
    const key =  crypto.getRandomValues(new Uint8Array(32));
    return key.buffer;
  }

  static async importAesKeyFromString(rawKey: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const data = encoder.encode(rawKey);
    // Hash the key string using SHA-256 to get a 256-bit value
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Imports a raw AES key from a base64‑encoded string.
   * @param rawKey The key as a base64 string.
   * @returns A Promise that resolves to a CryptoKey usable for AES-GCM.
   */
  static async importAesKey(rawKey: string): Promise<CryptoKey> {
    const keyBuffer = base64ToArrayBuffer(rawKey);
    return crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts a plaintext message using AES-GCM.
   * @param plaintext The text to encrypt.
   * @param key A CryptoKey for AES-GCM.
   * @returns A Promise resolving to an object containing:
   *   - iv: The initialization vector (base64-encoded)
   *   - ciphertext: The encrypted data (base64-encoded)
   */
  static async encryptMessage(
    plaintext: string,
    key: CryptoKey
  ): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    // Use a 12-byte IV for AES-GCM
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return {
      iv,
      ciphertext: new Uint8Array(encryptedBuffer)
    };
  }

  /**
   * Decrypts a ciphertext message using AES-GCM.
   * @param ciphertext The encrypted data as a base64 string.
   * @param key A CryptoKey for AES-GCM.
   * @param iv The initialization vector as a base64 string.
   * @returns A Promise resolving to the decrypted plaintext.
   */
  static async decryptMessage(
    ciphertext: Uint8Array,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<string> {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext.buffer // pass underlying ArrayBuffer
    );
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }
}