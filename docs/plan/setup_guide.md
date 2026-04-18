# Installation and Setup Guide - Laundry ERP & E-Commerce

This guide provides step-by-step instructions to set up the development environment on Windows 11 and prepare for production.

## 1. Development Environment (Windows 11)

### Prerequisites
1.  **Node.js (LTS):** Download and install from [nodejs.org](https://nodejs.org/).
2.  **Git:** Download and install from [git-scm.com](https://git-scm.com/).
3.  **PostgreSQL:**
    -   Download from [postgresql.org](https://www.postgresql.org/download/windows/).
    -   Install and set a password for the `postgres` user.
    -   Create a database named `laundry_db`.
4.  **VS Code:** Recommended editor.

### Step-by-Step Setup
1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd laundry-project
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the root:
    ```env
    DATABASE_URL="postgresql://postgres:password@localhost:5432/laundry_db?schema=public"
    JWT_SECRET="your_ultra_secure_fose_secret_key"
    NEXT_PUBLIC_BASE_URL="http://localhost:3000"
    ```
4.  **Database Migration:**
    ```bash
    npx prisma db push
    ```
5.  **Start Development Server:**
    ```bash
    npm run dev
    ```

---

## 2. Platform Preparation for Testing

1.  **Local Testing:**
    -   Run `npm run test` for unit and integration tests.
    -   Use `Vitest` as the FOSS testing framework.
2.  **Mock Data:**
    -   Seed the database with `npx prisma db seed` (scripts provided in `prisma/seed.ts`).
3.  **Browser Compatibility:**
    -   Test on Chrome, Firefox, and Safari (WebKit) using Playwright (FOSS).

---

## 3. Platform Preparation for Production (Linux Recommended)

For production, we recommend a FOSS-only VPS running Ubuntu 22.04 LTS.

### Server Setup (Ubuntu)
1.  **Update System:** `sudo apt update && sudo apt upgrade -y`
2.  **Install Nginx:** `sudo apt install nginx -y`
3.  **Install Node.js:** Use NodeSource or NVM.
4.  **Install PostgreSQL:**
    -   `sudo apt install postgresql postgresql-contrib -y`
    -   Configure `pg_hba.conf` for secure remote access if needed.
5.  **Process Manager (PM2):**
    -   `sudo npm install pm2 -g`
6.  **SSL (Let's Encrypt):**
    -   `sudo apt install certbot python3-certbot-nginx -y`
    -   `sudo certbot --nginx`
7.  **CI/CD:** Use **Gitea** or **GitLab (Community Edition)** for self-hosted FOSS version control and CI.

### Deployment Process
1.  Build the app: `npm run build`
2.  Start with PM2: `pm2 start npm --name "laundry-app" -- start`
3.  Configure Nginx as a reverse proxy to `http://localhost:3000`.
