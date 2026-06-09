# PT Intan Daya Mandiri (IDM) — Logistics Platform

Premium corporate website and logistics management platform for **PT Intan Daya Mandiri**.

## Status

**Phase 1 — Foundation** ✅ Complete  
**Phase 2 — Core Backend** ✅ Complete  
**Phase 3 — Public Website** ✅ Complete  
**Phase 4 — Admin Dashboard** 🚧 In Progress (Shipments, Customers, Branches, Fleet)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js v5 |
| Data Fetching | TanStack React Query |
| Animation | Framer Motion |

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Push schema & seed data
pnpm db:push
pnpm db:seed

# 4. Run dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Database Access

PostgreSQL runs in Docker and is exposed on **localhost:5432**.

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `idm` |
| User | `idm` |
| Password | `idm123` |

**Connection string:**
```
postgresql://idm:idm123@localhost:5432/idm?schema=public
```

**Web UI (Adminer):** [http://localhost:8080](http://localhost:8080)  
Login with system **PostgreSQL**, server **`postgres`**, and the credentials above.

**Prisma Studio:** `pnpm db:studio` → [http://localhost:5555](http://localhost:5555)

**psql:**
```bash
docker exec -it idm-postgres psql -U idm -d idm
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@ptintandayamandiri.co.id | Admin123! |
| Admin | manager@ptintandayamandiri.co.id | Admin123! |
| Operator | operator@ptintandayamandiri.co.id | Operator123! |
| Customer Service | cs@ptintandayamandiri.co.id | Admin123! |

**Demo tracking:** `IDM2026000001`

## API (Phase 2)

Staff endpoints require an authenticated session (login first). Public endpoints:

| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/v1/tracking/[number]` | GET | Public (rate-limited) |
| `/api/v1/contact` | POST | Public (rate-limited) |
| `/api/v1/shipments` | GET, POST | Staff |
| `/api/v1/shipments/[id]` | GET, PATCH, DELETE | Staff |
| `/api/v1/shipments/[id]/tracking` | POST | Staff |
| `/api/v1/customers` | GET, POST | Staff |
| `/api/v1/branches` | GET, POST | Staff |
| `/api/v1/fleet/vehicles` | GET, POST | Staff |
| `/api/v1/fleet/drivers` | GET, POST | Staff |
| `/api/v1/analytics` | GET | Staff |
| `/api/v1/export/excel` | POST | Staff |
| `/api/v1/export/pdf` | POST | Staff |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm db:push` | Push Prisma schema to DB |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Open Prisma Studio |

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture |
| [DATABASE_SCHEMA.prisma](./docs/DATABASE_SCHEMA.prisma) | Schema reference |
| [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) | UI design tokens |
| [ROADMAP.md](./docs/ROADMAP.md) | Implementation phases |

## Brand

- **Primary:** `#0F4C81` (Corporate Blue)
- **Secondary:** `#FF7A00` (Logistics Orange)
