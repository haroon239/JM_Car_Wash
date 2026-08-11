# JM Car Wash Billing Manager

Production-oriented customer subscription, invoice and payment management system for a UAE car-wash company.

## Owner workflow

- Add customers, locations, vehicles, custom prices and billing schedules.
- Generate recurring invoices and monitor the automatic billing health check.
- Share invoice PDFs through the device share menu or WhatsApp.
- Record full or partial payments while preserving customer and invoice history.
- Review location-scoped revenue, outstanding balances and overdue payments.
- Export customer and invoice reports as Excel-compatible CSV files.

Authentication is intentionally deferred while the application is operated by one owner. It should be enabled before access is shared with employees or third parties.

## Architecture

```text
JM car wash/
├── client/                         React + Vite frontend
│   └── src/
│       ├── app/                    Application shell and orchestration
│       ├── components/
│       │   ├── common/             Shared UI components
│       │   └── layout/             Sidebar and page header
│       ├── pages/                  Route-level business screens
│       ├── services/               HTTP/API client layer
│       ├── types/                  Shared frontend domain types
│       ├── main.tsx                Browser entry point
│       └── styles.css              Global design system
├── server/                         Node.js + Express API
│   ├── sql/                        Ordered PostgreSQL migrations
│   └── src/
│       ├── config/                 Environment and database configuration
│       ├── controllers/            HTTP request/response layer
│       ├── middleware/             Error and 404 handling
│       ├── models/                 PostgreSQL data-access layer
│       ├── routes/                 Express route definitions
│       ├── scripts/                Operational scripts and migrations
│       ├── validators/             Zod request schemas
│       ├── app.ts                  Express application composition
│       └── server.ts               API process entry point
├── .env.example                    Environment template
└── package.json                    npm workspace commands
```

The backend follows MVC-style separation: routes delegate to controllers, controllers validate requests and call models, and models own SQL/database access. Transaction-heavy invoice and payment operations remain encapsulated in their domain models.

## Local development

```bash
npm install
npm run db:migrate -w server
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000/api`
- Health check: `http://localhost:4000/api/health`

## Verification

```bash
npm run typecheck
npm test
npm run build
```

Secrets belong in `.env`. Environment files are excluded from Git.
