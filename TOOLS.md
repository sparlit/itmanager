# TOOLS.md - Project-Specific Notes

_Project-specific configuration, shortcuts, and notes._

## Database

- **Schema:** `E:\myproject\itmanager\prisma\schema.prisma`
- **Seed:** `npx tsx prisma/seed.ts`
- **Push schema:** `npm run db:push`
- **Generate client:** `npm run db:generate`

## Ports

- Main app: `http://localhost:3003`
- Internal portal: `http://localhost:3004`
- Customer portal: `http://localhost:3003` (conflicts with main — don't run both)

## Key API Endpoints

- `GET /api/dashboard` — aggregated metrics
- `GET /api/tickets` — ticket list
- `POST /api/tickets` — create ticket
- `GET /api/assets` — asset list
- `GET /api/inventory` — inventory list
- `GET /api/staff` — staff list

## Environment

- Node.js / npm (or bun)
- PostgreSQL running locally
- Next.js 16 dev server

## Development Notes

_(Add notes as you discover project-specific quirks.)_
