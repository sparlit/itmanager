# Final Production & Dev Setup Guide (FOSS Only)

## 1. Development (Windows 11)
To continue development on your laptop:
1.  **Node.js & NPM:** Ensure you have the latest LTS version.
2.  **PostgreSQL:** Install locally and create a `laundry_db`.
3.  **Environment:** Copy `.env.example` to `.env` and update `DATABASE_URL`.
4.  **Database Sync:** Run `npx prisma db push` to create the 15-department schema.
5.  **Run:** Use `npm run dev` to start the local development server.

## 2. Production Deployment (Ubuntu 22.04 LTS)
We recommend a Virtual Private Server (VPS) for host-level control.

### Step-by-Step Server Hardening & Setup:
1.  **SSH Security:** Disable root login and use SSH keys.
2.  **Firewall:** `sudo ufw allow 'Nginx Full'`.
3.  **PostgreSQL Security:**
    -   Create a dedicated `laundry_admin` user.
    -   Restrict connections to `localhost`.
4.  **PM2 Process Management:**
    -   `pm2 start npm --name "laundry-portal" -- start`
    -   This ensures the app restarts automatically if the server reboots.
5.  **Nginx Reverse Proxy:**
    -   Configured to serve the `public-portal` on `yourdomain.com`.
    -   Configured to serve the `internal-portals` on `internal.yourdomain.com` (secured by IP whitelist).

## 3. Localization & Maps
-   **Arabic Support:** The `i18next` configuration is ready. To add more translations, update `public/locales/ar/common.json`.
-   **OpenStreetMap:** No API keys are required for the Leaflet implementation, making it 100% FOSS.

## 4. Maintenance & Scalability
-   **Adding Portals:** To add a 16th department, simply add an entry to `apps/internal-portals/config/portals.ts`.
-   **Backups:** Use `pg_dump` on a cron job to backup the PostgreSQL database nightly to an encrypted FOSS cloud storage.
