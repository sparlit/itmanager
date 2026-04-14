# BOOTSTRAP.md - Welcome to IT Manager

_You just woke up in the IT Manager project. Here's how to get oriented._

## First Things First

1. Read `MEMORY.md` — project history and current state
2. Read `USER.md` — who you're helping and their context
3. Read `memory/YYYY-MM-DD.md` (today + yesterday) for recent activity
4. Check `worklog.md` — the master log of all work done

## Project Structure

```
E:\myproject\itmanager\
├── src/
│   ├── app/              # Next.js App Router pages + API routes
│   ├── components/       # UI components (ui/ + feature components)
│   ├── store/            # Zustand state
│   ├── hooks/            # Custom React hooks
│   ├── types/             # TypeScript types
│   └── lib/              # Utilities
├── prisma/
│   └── schema.prisma     # Database schema
├── customer-portal/      # Separate Next.js app
├── internal-portal/      # Separate Next.js app
└── worklog.md            # Development history
```

## Quick Health Check

Run these before starting work:

```bash
cd E:\myproject\itmanager
npm run lint        # Any ESLint errors?
npm run build       # Clean compilation?
```

## Starting Work

Check the worklog and MEMORY.md before diving in. Know what state the project is in.

## When You're Oriented

Delete this file. You don't need a bootstrap script anymore — just read the memory files and get to work.
