import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

// Key mã hóa 32 bytes (256 bits)
const DEFAULT_KEY =
  process.env.DATASOURCE_ENCRYPTION_KEY ||
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

@Injectable()
export class EncryptionService {
  private getKey(): Buffer {
    const keyString = process.env.DATASOURCE_ENCRYPTION_KEY || DEFAULT_KEY;
    // Đảm bảo đủ 32 bytes
    return crypto.createHash('sha256').update(keyString).digest();
  }

  /**
   * Mã hóa chuỗi văn bản (ví dụ password database) sử dụng AES-256-GCM
   * Trả về định dạng: `iv_hex:authTag_hex:ciphertext_hex`
   */
  encrypt(text: string): string {
    if (!text) return '';
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = this.getKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Giải mã chuỗi đã mã hóa định dạng `iv_hex:authTag_hex:ciphertext_hex`
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Định dạng chuỗi mã hóa không hợp lệ');
    }

    const [ivHex, authTagHex, cipherHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = this.getKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
