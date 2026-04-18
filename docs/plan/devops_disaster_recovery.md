# FINAL DISASTER RECOVERY & DEVOPS DOCUMENTATION
# Focus: PITR, WhatsApp, and CI/CD

## 1. DISASTER RECOVERY (POSTGRESQL PITR)
The system is protected by **Point-In-Time Recovery**.
- **WAL-G Config:** Continuous archiving of Write-Ahead Logs to MinIO.
- **Restore Command:** `wal-g restore-push lundry_db_backup --restore-to="2025-05-20 23:59:59"`
- **Benefit:** If the database crashes at midnight, we can restore to 11:59:58 PM with near-zero data loss.

## 2. CI/CD PIPELINE (GITHUB ACTIONS)
- **Repo:** `.github/workflows/main_ci_cd.yml`
- **Logic:**
    - Every push to `main` runs tests and linter.
    - Every merge to `production` triggers the automated deployment to your Qatar VPS.
    - **Self-Healing:** If the build fails, the production site remains online (blue-green style).

## 3. WHATSAPP & COMMUNICATIONS
- **Channel:** WhatsApp via Twilio/Meta Business.
- **Rules:**
    - Order status updates are WhatsApp-first.
    - 120-second timeout: If WhatsApp delivery fails, the **CommsService** automatically switches to SMS.
    - All messages include the localized "Doha Tracking Link".

## 4. SECURITY & MFA
- **Requirement:** Finance, HR, and Admin logins REQUIRE a TOTP token (Google Authenticator).
- **Service:** `packages/logic/auth/mfa-service.ts` handles all verification.
