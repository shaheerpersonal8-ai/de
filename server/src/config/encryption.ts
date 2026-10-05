import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { env } from './env';

/**
 * Evidence encryption manager for sensitive/private evidence
 */
export class EvidenceEncryptionManager {
  private encryptionKey: Buffer | null = null;

  constructor() {
    this.loadOrGenerateEncryptionKey();
  }

  /**
   * Load encryption key from file or generate new one
   */
  private loadOrGenerateEncryptionKey(): void {
    if (!env.privateEvidenceEncryptionEnabled) {
      console.log('[Encryption] Private evidence encryption disabled');
      return;
    }

    const keyPath = path.expand(env.evidenceEncryptionKeyPath);
    const keyDir = path.dirname(keyPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(keyDir)) {
      fs.mkdirSync(keyDir, { recursive: true, mode: 0o700 });
    }

    // Load existing key or generate new one
    if (fs.existsSync(keyPath)) {
      try {
        this.encryptionKey = fs.readFileSync(keyPath);
        if (this.encryptionKey.length !== 32) {
          throw new Error('Invalid encryption key size');
        }
        console.log('✓ Encryption key loaded from:', keyPath);
      } catch (err) {
        console.error('Failed to load encryption key:', err);
        this.generateAndSaveKey(keyPath);
      }
    } else {
      this.generateAndSaveKey(keyPath);
    }
  }

  private generateAndSaveKey(keyPath: string): void {
    this.encryptionKey = crypto.randomBytes(32);
    try {
      fs.writeFileSync(keyPath, this.encryptionKey, { mode: 0o600 });
      console.log('✓ Generated and saved new encryption key to:', keyPath);
    } catch (err) {
      console.error('Failed to save encryption key:', err);
      throw new Error('Could not initialize encryption key');
    }
  }

  /**
   * Encrypt sensitive evidence data
   */
  encrypt(data: string, associatedData?: string): { iv: string; ciphertext: string; tag: string } {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    if (associatedData) {
      cipher.setAAD(Buffer.from(associatedData, 'utf8'));
    }

    let ciphertext = cipher.update(data, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const tag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      ciphertext,
      tag: tag.toString('hex'),
    };
  }

  /**
   * Decrypt sensitive evidence data
   */
  decrypt(
    encrypted: { iv: string; ciphertext: string; tag: string },
    associatedData?: string
  ): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const iv = Buffer.from(encrypted.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
    const tag = Buffer.from(encrypted.tag, 'hex');

    if (associatedData) {
      decipher.setAAD(Buffer.from(associatedData, 'utf8'));
    }

    decipher.setAuthTag(tag);

    let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  }
}

export const encryptionManager = new EvidenceEncryptionManager();
