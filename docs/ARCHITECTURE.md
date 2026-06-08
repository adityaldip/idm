# IDM Platform — System Architecture

> **PT Intan Daya Mandiri** — Shipping & Logistics Corporate Website + Admin Platform  
> Version: 1.0 | Phase: Architecture

---

## 1. Executive Summary

IDM is a dual-surface application:

1. **Public Marketing Site** — SEO-optimized corporate presence with shipment tracking
2. **Admin Dashboard** — Authenticated SaaS-style operations console for internal staff

Both surfaces share a single Next.js 15 monorepo, PostgreSQL database, and design system. The architecture prioritizes **separation of concerns**, **role-based access**, and **scalability** from day one.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                       │
│   Public Visitors          Staff (Admin)           API Consumers        │
└──────────────┬─────────────────────┬────────────────────┬─────────────┘
               │                     │                      │
               ▼                     ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 APP (App Router)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │  Public Routes  │  │  Admin Routes   │  │  API Routes (Route Hdlrs)│  │
│  │  (marketing)    │  │  (dashboard)    │  │  /api/v1/*               │  │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬─────────────┘  │
│           │                    │                         │                 │
│  ┌────────▼────────────────────▼─────────────────────────▼─────────────┐  │
│  │              Server Components + Server Actions                      │  │
│  │              React Query (client cache) + Framer Motion              │  │
│  └──────────────────────────────┬──────────────────────────────────────┘  │
│                                 │                                          │
│  ┌──────────────────────────────▼──────────────────────────────────────┐  │
│  │  Services Layer (business logic, validation, permissions)           │  │
│  └──────────────────────────────┬──────────────────────────────────────┘  │
└─────────────────────────────────┼──────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
   ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
   │ PostgreSQL  │        │  File Store │        │  Email/SMS  │
   │  (Prisma)   │        │  (S3/R2)    │        │  (optional) │
   └─────────────┘        └─────────────┘        └─────────────┘
```

---

## 2. Architectural Principles

| Principle | Implementation |
|-----------|----------------|
| **Colocation** | Feature modules group components, hooks, services, and types |
| **Server-first** | Default to RSC; client components only when interactivity required |
| **Type safety** | End-to-end types via Prisma + Zod validation |
| **RBAC everywhere** | Middleware + service-layer permission checks |
| **Audit trail** | Tracking history + activity logs for compliance |
| **Progressive enhancement** | Public tracking works without JS; dashboard is SPA-like |
| **SEO by default** | Metadata API, sitemap, structured data on public pages |

---

## 3. Folder Structure

```
idm/
├── .env.example
├── .env.local                    # gitignored
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── prisma/
│   ├── schema.prisma             # Source of truth (copy from docs/DATABASE_SCHEMA.prisma)
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── images/
│   │   ├── logo/
│   │   ├── hero/
│   │   └── partners/
│   ├── fonts/                    # Self-hosted if needed
│   └── og/                       # Open Graph images
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (public)/             # Marketing layout group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Home
│   │   │   ├── about/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   ├── tracking/
│   │   │   │   ├── page.tsx                # Tracking search
│   │   │   │   └── [trackingNumber]/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/          # Admin layout group (protected)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── shipments/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── tracking/page.tsx
│   │   │   ├── customers/
│   │   │   ├── branches/
│   │   │   ├── fleet/
│   │   │   │   ├── vehicles/
│   │   │   │   └── drivers/
│   │   │   ├── news/
│   │   │   ├── testimonials/
│   │   │   ├── content/          # CMS for public pages
│   │   │   ├── users/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── v1/
│   │   │       ├── tracking/[number]/route.ts   # Public tracking API
│   │   │       ├── shipments/route.ts
│   │   │       ├── export/
│   │   │       │   ├── pdf/route.ts
│   │   │       │   └── excel/route.ts
│   │   │       └── webhooks/                    # Future integrations
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── layout/
│   │   │   ├── public-header.tsx
│   │   │   ├── public-footer.tsx
│   │   │   ├── dashboard-sidebar.tsx
│   │   │   └── dashboard-header.tsx
│   │   ├── marketing/
│   │   │   ├── hero-section.tsx
│   │   │   ├── services-grid.tsx
│   │   │   ├── coverage-map.tsx
│   │   │   ├── testimonials-carousel.tsx
│   │   │   └── contact-form.tsx
│   │   ├── tracking/
│   │   │   ├── tracking-search.tsx
│   │   │   ├── tracking-result.tsx
│   │   │   └── tracking-timeline.tsx
│   │   ├── dashboard/
│   │   │   ├── kpi-cards.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── shipment-chart.tsx
│   │   │   ├── activity-feed.tsx
│   │   │   ├── data-table/
│   │   │   └── export-button.tsx
│   │   └── shared/
│   │       ├── theme-toggle.tsx
│   │       ├── logo.tsx
│   │       └── page-header.tsx
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── auth.ts               # NextAuth config
│   │   ├── permissions.ts        # RBAC helpers
│   │   ├── utils.ts              # cn(), formatters
│   │   ├── constants.ts
│   │   └── validators/           # Zod schemas
│   │       ├── shipment.ts
│   │       ├── customer.ts
│   │       └── ...
│   ├── services/                 # Business logic (server-only)
│   │   ├── shipment.service.ts
│   │   ├── tracking.service.ts
│   │   ├── customer.service.ts
│   │   ├── analytics.service.ts
│   │   ├── export.service.ts
│   │   └── cms.service.ts
│   ├── hooks/
│   │   ├── use-permissions.ts
│   │   └── use-debounce.ts
│   ├── providers/
│   │   ├── query-provider.tsx
│   │   ├── theme-provider.tsx
│   │   └── session-provider.tsx
│   ├── types/
│   │   ├── index.ts
│   │   ├── shipment.ts
│   │   └── api.ts
│   └── middleware.ts             # Auth + route protection
└── docs/
    ├── ARCHITECTURE.md
    ├── DATABASE_SCHEMA.prisma
    ├── DESIGN_SYSTEM.md
    └── ROADMAP.md
```

---

## 4. Route Structure

### 4.1 Public Routes (unauthenticated)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Home | Hero, services preview, testimonials, CTA |
| `/about` | About Us | Company profile, vision/mission, leadership |
| `/services` | Services | Full service catalog, coverage |
| `/tracking` | Tracking Search | Input tracking number |
| `/tracking/[trackingNumber]` | Tracking Result | Status, location, ETA, timeline |
| `/contact` | Contact | Form, branch locations, map |

### 4.2 Auth Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/login` | Login | Credentials login for staff |

### 4.3 Admin Dashboard Routes (authenticated + RBAC)

| Route | Module | Min Role |
|-------|--------|----------|
| `/dashboard` | Analytics | Operator |
| `/shipments` | Shipment list | Operator |
| `/shipments/new` | Create shipment | Operator |
| `/shipments/[id]` | Shipment detail | Operator |
| `/shipments/[id]/tracking` | Add tracking update | Operator |
| `/customers` | Customer CRUD | Customer Service |
| `/branches` | Branch management | Admin |
| `/fleet/vehicles` | Vehicle fleet | Admin |
| `/fleet/drivers` | Driver management | Admin |
| `/news` | News/articles | Admin |
| `/testimonials` | Testimonials CMS | Admin |
| `/content` | Website content blocks | Admin |
| `/users` | User & role management | Super Admin |
| `/settings` | System settings | Super Admin |

### 4.4 API Routes

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/*` | * | — | NextAuth handlers |
| `/api/v1/tracking/[number]` | GET | Public | Tracking lookup (rate-limited) |
| `/api/v1/shipments` | GET, POST | Staff | Shipment CRUD |
| `/api/v1/shipments/[id]` | GET, PATCH, DELETE | Staff | Single shipment |
| `/api/v1/shipments/[id]/tracking` | POST | Staff | Add tracking event |
| `/api/v1/customers` | * | Staff | Customer API |
| `/api/v1/analytics` | GET | Staff | Dashboard KPIs |
| `/api/v1/export/pdf` | POST | Staff | PDF export |
| `/api/v1/export/excel` | POST | Staff | Excel export |
| `/api/v1/contact` | POST | Public | Contact form submission |

---

## 5. Authentication Flow

### 5.1 Strategy

- **Provider:** Credentials (email + password) for internal staff
- **Session:** JWT strategy (stateless, edge-compatible) with short-lived tokens
- **Password:** bcrypt hashing via `bcryptjs`
- **Future:** Optional OAuth (Google Workspace) for enterprise SSO

### 5.2 Flow Diagram

```
┌──────────┐     POST /login      ┌─────────────┐
│  Staff   │ ──────────────────►  │  Login Page │
│  Browser │                      │  (client)   │
└──────────┘                      └──────┬──────┘
                                         │ signIn("credentials")
                                         ▼
                                  ┌─────────────┐
                                  │  NextAuth   │
                                  │  authorize()│
                                  └──────┬──────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
             Validate email      Check isActive        Compare password
             against User        flag on User          (bcrypt)
                    │                    │                    │
                    └────────────────────┼────────────────────┘
                                         ▼
                                  ┌─────────────┐
                                  │  JWT issued │
                                  │  role embedded
                                  └──────┬──────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │ Middleware  │
                                  │ checks JWT  │
                                  │ + role for  │
                                  │ /dashboard/*│
                                  └──────┬──────┘
                                         │
                          ┌──────────────┴──────────────┐
                          ▼                             ▼
                   Allowed route                  Redirect /login
                   + inject session               or /unauthorized
```

### 5.3 Middleware Rules (`src/middleware.ts`)

```typescript
// Pseudocode — implementation in Phase 2
const publicPaths = ['/', '/about', '/services', '/tracking', '/contact', '/login'];
const adminPrefix = '/dashboard'; // and all /shipments, /customers, etc.

// 1. Allow public paths without session
// 2. Redirect authenticated users away from /login → /dashboard
// 3. Require session for all dashboard routes
// 4. Check role permissions per route prefix (see permissions.ts)
```

### 5.4 Role Hierarchy & Permissions

| Permission | Super Admin | Admin | Operator | Customer Service |
|------------|:-----------:|:-----:|:--------:|:----------------:|
| Dashboard analytics | ✓ | ✓ | ✓ | ✓ |
| Manage shipments | ✓ | ✓ | ✓ | Read |
| Add tracking updates | ✓ | ✓ | ✓ | ✓ |
| Manage customers | ✓ | ✓ | Read | ✓ |
| Manage branches | ✓ | ✓ | — | — |
| Manage fleet | ✓ | ✓ | — | — |
| Manage news/testimonials | ✓ | ✓ | — | — |
| CMS content | ✓ | ✓ | — | — |
| Manage users/roles | ✓ | — | — | — |
| System settings | ✓ | — | — | — |
| Export PDF/Excel | ✓ | ✓ | ✓ | ✓ |

### 5.5 Session Payload

```typescript
interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'CUSTOMER_SERVICE';
  branchId?: string;  // Optional branch scoping for operators
}
```

---

## 6. Data Flow Patterns

### 6.1 Public Tracking

```
User enters tracking number
        │
        ▼
/tracking/[number] (RSC)
        │
        ▼
tracking.service.ts → Prisma
        │
        ├── Shipment (status, ETA, location)
        └── TrackingHistory[] (ordered timeline)
        │
        ▼
Render TrackingResult + Timeline (client animations via Framer Motion)
```

- Public API mirrors this at `GET /api/v1/tracking/[number]`
- Rate limit: 30 req/min per IP (middleware or Upstash Redis in production)

### 6.2 Admin Shipment Management

```
Dashboard table (React Query)
        │
        ▼
GET /api/v1/shipments?status=&branch=&dateRange=
        │
        ▼
shipment.service.ts
  ├── RBAC filter (branch-scoped for operators)
  ├── Pagination + sorting
  └── Return typed response
        │
        ▼
DataTable with filters → Export triggers POST /api/v1/export/*
```

### 6.3 Tracking Update (Write Path)

```
Operator submits status change
        │
        ▼
Server Action OR POST /api/v1/shipments/[id]/tracking
        │
        ▼
Zod validation → permissions check
        │
        ▼
Prisma transaction:
  1. Insert TrackingHistory record
  2. Update Shipment.status, currentLocation, estimatedDelivery
  3. Log Activity (audit)
        │
        ▼
Invalidate React Query cache → UI refresh
```

---

## 7. Shipment Status State Machine

```
                    ┌──────────┐
                    │ CREATED  │
                    └────┬─────┘
                         │ PICKED_UP
                         ▼
                    ┌──────────┐
         ┌──────────│PICKED_UP │──────────┐
         │          └────┬─────┘          │
         │               │ IN_WAREHOUSE   │
         │               ▼                │
         │          ┌────────────┐        │
         │          │IN_WAREHOUSE│        │
         │          └─────┬──────┘        │
         │                │ IN_TRANSIT    │
         │                ▼               │
         │          ┌────────────┐        │
         │          │ IN_TRANSIT │        │
         │          └─────┬──────┘        │
         │                │ OUT_FOR_DELIVERY
         │                ▼               │
         │          ┌────────────────┐   │
         │          │OUT_FOR_DELIVERY│   │
         │          └───────┬────────┘   │
         │                  │ DELIVERED  │
         │                  ▼            │ RETURNED (from any active state)
         │          ┌───────────┐         │
         └─────────►│ DELIVERED │         │
                    └───────────┘         │
                                          ▼
                                    ┌──────────┐
                                    │ RETURNED │
                                    └──────────┘
```

Valid transitions enforced in `tracking.service.ts` — invalid jumps rejected with 422.

---

## 8. Cross-Cutting Concerns

### 8.1 SEO (Public)

- `generateMetadata()` per page with Open Graph + Twitter cards
- JSON-LD `Organization` + `LocalBusiness` on home/contact
- Dynamic sitemap from CMS content
- `robots.ts` — allow public, disallow `/dashboard`, `/api`

### 8.2 Dark Mode

- `next-themes` with system default
- CSS variables in `globals.css` (see DESIGN_SYSTEM.md)
- Persist preference in localStorage

### 8.3 Error Handling

| Layer | Strategy |
|-------|----------|
| API | Consistent `{ error: { code, message } }` envelope |
| Forms | Zod + react-hook-form field errors |
| Pages | `error.tsx` + `not-found.tsx` per route group |
| Tracking | Graceful "not found" for invalid numbers |

### 8.4 Security

- CSRF: Built into Server Actions
- SQL injection: Prisma parameterized queries
- XSS: React escaping + sanitize CMS HTML (DOMPurify)
- Rate limiting on public tracking + contact form
- Helmet-style headers via `next.config.ts`
- Audit log for sensitive admin actions

### 8.5 Performance

- Image optimization via `next/image`
- Route-level loading skeletons
- React Query staleTime tuning per resource
- Database indexes on `trackingNumber`, `status`, `createdAt`
- Optional: Redis cache for public tracking reads

---

## 9. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/idm"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_COMPANY_NAME="PT Intan Daya Mandiri"

# Optional
UPLOADTHING_SECRET=""          # File uploads
RESEND_API_KEY=""              # Transactional email
UPSTASH_REDIS_REST_URL=""      # Rate limiting
```

---

## 10. Deployment Architecture (Target)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │────►│  PostgreSQL │     │  S3 / R2    │
│  (Next.js)  │     │  (Neon/     │     │  (assets)   │
│             │     │   Supabase) │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **CI/CD:** GitHub Actions → lint, typecheck, prisma migrate, deploy
- **Preview:** Vercel preview deployments per PR
- **Production:** `main` branch auto-deploy

---

## 11. Key Dependencies (planned)

```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "@prisma/client": "latest",
    "next-auth": "^5",
    "@tanstack/react-query": "^5",
    "framer-motion": "^11",
    "zod": "^3",
    "bcryptjs": "^2",
    "recharts": "^2",
    "jspdf": "^2",
    "xlsx": "^0.18",
    "date-fns": "^3",
    "next-themes": "^0.4"
  },
  "devDependencies": {
    "prisma": "latest",
    "typescript": "^5",
    "tailwindcss": "^4",
    "@types/node": "latest",
    "@types/react": "latest"
  }
}
```

---

*Next step: See [ROADMAP.md](./ROADMAP.md) for phased implementation.*
