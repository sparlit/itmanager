import { authenticator } from 'otplib';

/**
 * PRODUCTION-GRADE TOTP MFA SERVICE (ZERO-STUB)
 * Specifically for Finance, HR, and Admin portals.
 */
export class MfaService {
  /**
   * Generates a new TOTP secret for a user
   */
  static generateSecret(userEmail: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(userEmail, 'Pristine_Laundry_Qatar', secret);
    return { secret, otpauth };
  }

  /**
   * Verifies a TOTP token against a secret
   */
  static verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.check(token, secret);
    } catch (err) {
      return false;
    }
  }

  /**
   * Enforces MFA check for sensitive portals
   */
  static async validatePortalAccess(user: { role: string, mfaSecret?: string }, token?: string): Promise<boolean> {
    const sensitiveRoles = ['ADMIN', 'FINANCE', 'HR'];

    if (sensitiveRoles.includes(user.role)) {
      if (!user.mfaSecret) return false; // MFA not set up
      if (!token) return false; // Token missing
      return this.verifyToken(token, user.mfaSecret);
    }

    return true; // No MFA required for non-sensitive portals
  }
}
