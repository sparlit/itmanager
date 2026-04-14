Port Plan for Dual-Port Apps Behind Single Entry

- Customer portal runs on port 3003 (http://localhost:3003)
- IT/Internal portal runs on port 3004 (http://localhost:3004)
- A small Node-based reverse proxy runs on port 3000 to expose both via a single entry point:
  - /customer/* -> http://localhost:3003/*
  - /internal/* -> http://localhost:3004/*

How to run locally (no Docker)
- Install dependencies for both apps (from their respective folders) and start individually:
  - cd customer-portal && npm install && npm run dev -- -p 3003
  - cd internal-portal && npm install && npm run dev -- -p 3004
- Start the proxy:
  - node server/proxy.js
- Then access:
  - http://localhost:3000/customer/... for customer portal routes
  - http://localhost:3000/internal/... for internal IT portal routes
