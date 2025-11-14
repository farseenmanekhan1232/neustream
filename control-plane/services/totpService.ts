import crypto from 'crypto';
import { authenticator } from 'otplib';
import Database from '../lib/database';

interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

interface BackupCode {
  code: string;
  used: boolean;
}

interface UserTOTP {
  totp_secret?: string;
  totp_enabled: boolean;
}

// Configure TOTP
authenticator.options = {
  step: 30, // 30-second windows
  window: 2, // Allow ±1 window for clock skew
  digits: 6, // Standard 6-digit codes
  algorithm: 'sha1' as any
};

/**
 * TOTP Service
 * Handles Time-based One-Time Password (TOTP) authentication
 * Provides 2FA support using authenticator apps
 */
class TOTPService {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  /**
   * Generate a new TOTP secret for a user
   */
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Generate QR code URL for authenticator apps
   */
  generateQRCodeURL(secret: string, email: string): string {
    return authenticator.keyuri(email, 'Neustream', secret);
  }

  /**
   * Verify a TOTP code
   */
  verifyCode(secret: string, code: string): boolean {
    return authenticator.verify({ token: code, secret });
  }

  /**
   * Generate current TOTP code
   */
  generateCode(secret: string): string {
    return authenticator.generate(secret);
  }

  /**
   * Enable TOTP for a user
   */
  async enableTOTP(userId: number, totpSecret: string): Promise<boolean> {
    try {
      // Store the TOTP secret (in production, this should be encrypted)
      await this.db.query(
        'UPDATE users SET totp_secret = $1, totp_enabled = true WHERE id = $2',
        [totpSecret, userId]
      );

      return true;
    } catch (error) {
      console.error('Error enabling TOTP:', error);
      throw error;
    }
  }

  /**
   * Disable TOTP for a user
   */
  async disableTOTP(userId: number): Promise<boolean> {
    try {
      await this.db.query(
        'UPDATE users SET totp_secret = NULL, totp_enabled = false WHERE id = $1',
        [userId]
      );
      return true;
    } catch (error) {
      console.error('Error disabling TOTP:', error);
      throw error;
    }
  }

  /**
   * Verify TOTP code for a user
   */
  async verifyUserTOTP(userId: number, code: string): Promise<boolean> {
    try {
      // Get user's TOTP secret
      const users = await this.db.query<UserTOTP>(
        'SELECT totp_secret, totp_enabled FROM users WHERE id = $1',
        [userId]
      );

      if (users.length === 0 || !users[0].totp_enabled || !users[0].totp_secret) {
        return false;
      }

      return this.verifyCode(users[0].totp_secret, code);
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      return false;
    }
  }

  /**
   * Check if user has TOTP enabled
   */
  async isTOTPEnabled(userId: number): Promise<boolean> {
    try {
      const users = await this.db.query<{ totp_enabled: boolean }>(
        'SELECT totp_enabled FROM users WHERE id = $1',
        [userId]
      );

      return users.length > 0 && users[0].totp_enabled === true;
    } catch (error) {
      console.error('Error checking TOTP status:', error);
      return false;
    }
  }

  /**
   * Encrypt stream keys using TOTP
   */
  encryptStreamKey(streamKey: string, totpCode: string): EncryptedData {
    const algorithm = 'aes-256-gcm';
    const key = crypto.createHash('sha256').update(totpCode).digest();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('neustream'));

    let encrypted = cipher.update(streamKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt stream keys using TOTP
   */
  decryptStreamKey(encryptedData: EncryptedData, totpCode: string): string {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.createHash('sha256').update(totpCode).digest();
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const authTag = Buffer.from(encryptedData.authTag, 'hex');

      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAAD(Buffer.from('neustream'));
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Error decrypting stream key:', error);
      throw new Error('Failed to decrypt stream key');
    }
  }

  /**
   * Generate backup codes for emergency access
   */
  generateBackupCodes(count: number = 10): BackupCode[] {
    const codes: BackupCode[] = [];
    for (let i = 0; i < count; i++) {
      codes.push({
        code: crypto.randomBytes(8).toString('hex'), // 16-character codes
        used: false
      });
    }
    return codes;
  }

  /**
   * Hash backup code for secure storage
   */
  hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(providedCode: string, storedHash: string): boolean {
    const providedHash = this.hashBackupCode(providedCode);
    return crypto.timingSafeEqual(
      Buffer.from(providedHash, 'hex'),
      Buffer.from(storedHash, 'hex')
    );
  }
}

export default TOTPService;
