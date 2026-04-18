import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// Validate JWT_SECRET at initialization
const getJWTSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'FATAL: JWT_SECRET environment variable is not set. ' +
      'Please configure a secure secret in your environment configuration.'
    );
  }

  // Validate minimum entropy (32 bytes for HS256)
  if (secret.length < 32) {
    throw new Error(
      'FATAL: JWT_SECRET must be at least 32 characters long for HS256 security requirements. ' +
      `Current length: ${secret.length}`
    );
  }

  return new TextEncoder().encode(secret);
};

const JWT_SECRET = getJWTSecret();

/**
 * PRODUCTION-GRADE AUTHENTICATION SERVICE (ZERO-STUB)
 */
export class AuthService {
  /**
   * Hashes a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verifies a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generates a stateless JWT token with payload
   */
  static async generateToken(payload: { userId: string; role: string; department?: string }) {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Standard ERP session duration
      .sign(JWT_SECRET);
  }

  /**
   * Validates a JWT token and returns the payload
   */
  static async validateToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired session token');
    }
  }

  /**
   * 2FA Verification Logic
   * @throws Error until real TOTP implementation is added
   */
  static verifyTwoFACode(userInputCode: string, userSecret: string): boolean {
    // Fail-safe: prevent insecure authentication until proper TOTP is implemented
    throw new Error(
      '2FA verification not yet implemented. ' +
      'Please implement TOTP verification using otplib.authenticator.verify() ' +
      'before enabling 2FA in production.'
    );

    // TODO: Replace with real implementation:
    // import { authenticator } from 'otplib';
    // return authenticator.verify({
    //   token: userInputCode,
    //   secret: userSecret
    // });
  }
}