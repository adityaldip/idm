# IDM Development Roadmap

> Phased implementation plan — PT Intan Daya Mandiri Logistics Platform

---

## Overview

| Phase | Name | Duration (est.) | Deliverable |
|-------|------|-----------------|-------------|
| 0 | Architecture | ✅ Complete | Docs, schema, design system |
| 1 | Foundation | ✅ Complete | Scaffold, DB, auth shell |
| 2 | Core Backend | ✅ Complete | Services, API, RBAC |
| 3 | Public Website | ✅ Complete | Marketing pages + tracking |
| 4 | Admin Dashboard | 🚧 In Progress | Full operations console |
| 5 | Polish & Launch | 3–4 days | SEO, tests, deploy |

**Total estimate:** ~22–27 working days for MVP

---

## Phase 0 — Architecture & Planning ✅

**Status:** Complete

- [x] System architecture document
- [x] Folder structure specification
- [x] Prisma schema design
- [x] Route structure
- [x] Authentication flow design
- [x] UI design system
- [x] Development roadmap

**Artifacts:** `docs/ARCHITECTURE.md`, `docs/DATABASE_SCHEMA.prisma`, `docs/DESIGN_SYSTEM.md`, `docs/ROADMAP.md`

---

## Phase 1 — Foundation (Scaffold)

**Goal:** Runnable Next.js 15 project with database, auth skeleton, and design tokens.

### Tasks

| # | Task | Details |
|---|------|---------|
| 1.1 | Initialize Next.js 15 | App Router, TypeScript, Tailwind CSS v4, ESLint |
| 1.2 | Install shadcn/ui | Init with custom theme (primary #0F4C81, secondary #FF7A00) |
| 1.3 | Setup Prisma | Copy schema from `docs/DATABASE_SCHEMA.prisma`, configure PostgreSQL |
| 1.4 | Database seed | Super admin user, sample branches, services, settings |
| 1.5 | NextAuth v5 | Credentials provider, JWT session, login page |
| 1.6 | Middleware | Route protection for dashboard routes |
| 1.7 | Providers | Theme, React Query, Session providers |
| 1.8 | Layout shells | Public layout, auth layout, dashboard layout (sidebar skeleton) |
| 1.9 | Design tokens | `globals.css` variables, fonts (Plus Jakarta Sans, Inter) |
| 1.10 | Env & scripts | `.env.example`, `db:push`, `db:seed`, `dev` scripts |

### Acceptance Criteria

- `pnpm dev` runs without errors
- Login works with seeded super admin
- Unauthenticated users redirected from `/dashboard`
- Dark mode toggle functional
- Database migrations applied

### Dependencies

```
next, react, typescript, tailwindcss, prisma, @prisma/client,
next-auth, @tanstack/react-query, framer-motion, next-themes,
bcryptjs, zod, lucide-react
```

---

## Phase 2 — Core Backend (Services & API)

**Goal:** Business logic layer and REST API with RBAC.

### Tasks

| # | Task | Details |
|---|------|---------|
| 2.1 | Permissions module | `lib/permissions.ts` — role checks, route guards |
| 2.2 | Zod validators | Schemas for all entities |
| 2.3 | Shipment service | CRUD, tracking number generation, status machine |
| 2.4 | Tracking service | Public lookup, history append, transition validation |
| 2.5 | Customer service | CRUD with search/pagination |
| 2.6 | Branch service | CRUD, geo fields |
| 2.7 | Fleet service | Vehicles + drivers CRUD, assignment |
| 2.8 | Analytics service | KPI aggregation queries |
| 2.9 | CMS service | Content blocks, news, testimonials, partners |
| 2.10 | Activity logging | Auto-log on write operations |
| 2.11 | API routes | `/api/v1/*` endpoints per ARCHITECTURE.md |
| 2.12 | Export service | PDF (jsPDF) + Excel (xlsx) generation |
| 2.13 | Rate limiting | Public tracking + contact endpoints |

### Acceptance Criteria

- All API routes return typed, validated responses
- RBAC enforced — operator cannot access `/users`
- Tracking number auto-generated on shipment create
- Invalid status transitions return 422
- Activity log entries created on mutations

---

## Phase 3 — Public Website

**Goal:** Premium corporate site with live tracking.

### Tasks

| # | Task | Details |
|---|------|---------|
| 3.1 | Public header/footer | Responsive nav, mobile sheet, theme toggle |
| 3.2 | Home page | Hero, stats, services preview, testimonials, CTA |
| 3.3 | About page | Company profile, vision/mission, timeline |
| 3.4 | Services page | Service offerings grid from DB |
| 3.5 | Coverage section | Province/city coverage map or list |
| 3.6 | Tracking search | Input + redirect to result page |
| 3.7 | Tracking result | Status card, ETA, location, animated timeline |
| 3.8 | Contact page | Form → `ContactSubmission`, branch locations |
| 3.9 | Testimonials | Carousel with Framer Motion |
| 3.10 | SEO | Metadata, sitemap, robots, JSON-LD |
| 3.11 | Animations | Scroll-triggered reveals, hero stagger |
| 3.12 | Partners strip | Logo carousel from DB |

### Acceptance Criteria

- All 5 public pages render with real CMS data
- Tracking works end-to-end with seeded shipments
- Lighthouse SEO score ≥ 90
- Fully responsive (320px → 1920px)
- Dark mode consistent across all pages

---

## Phase 4 — Admin Dashboard

**Goal:** Full operations console for internal staff.

### Module Build Order

```
Dashboard Analytics → Shipments → Tracking Updates → Customers
    → Branches → Fleet → News → Testimonials → CMS → Users → Settings
```

### Tasks

| # | Module | Features |
|---|--------|----------|
| 4.1 | Dashboard | KPI cards, revenue chart, shipment chart, activity feed |
| 4.2 | Shipments | DataTable, filters (status, branch, date), create/edit forms |
| 4.3 | Tracking Updates | Inline status update, location, notes, history view |
| 4.4 | Customers | CRUD table, search, link to shipments |
| 4.5 | Branches | CRUD, map coordinates, active toggle |
| 4.6 | Fleet — Vehicles | CRUD, status management, branch assignment |
| 4.7 | Fleet — Drivers | CRUD, license tracking, vehicle assignment |
| 4.8 | News | Rich text editor, draft/publish workflow |
| 4.9 | Testimonials | CRUD, rating, sort order, active toggle |
| 4.10 | Content CMS | Edit hero, about, CTA blocks |
| 4.11 | Users | CRUD, role assignment, activate/deactivate |
| 4.12 | Settings | Key-value settings by group |
| 4.13 | Export | PDF/Excel from filtered shipment tables |
| 4.14 | Contact inbox | View/read contact submissions |

### Dashboard UX Requirements

- Sidebar navigation with role-based visibility
- Breadcrumbs on detail pages
- Toast notifications (Sonner) on mutations
- Loading skeletons on all data pages
- Empty states with helpful CTAs
- Confirmation dialogs on destructive actions

### Acceptance Criteria

- Each role sees only permitted modules
- Shipment create → tracking update → public tracking reflects changes
- Charts display real aggregated data
- Export downloads valid PDF/Excel files
- All CRUD operations logged in activity feed

---

## Phase 5 — Polish & Launch

**Goal:** Production-ready deployment.

### Tasks

| # | Task | Details |
|---|------|---------|
| 5.1 | Error pages | Custom 404, 500, unauthorized |
| 5.2 | Loading states | Route-level `loading.tsx` for all pages |
| 5.3 | Performance | Image optimization, query caching tuning |
| 5.4 | Security audit | Headers, rate limits, input sanitization |
| 5.5 | E2E tests | Critical paths: login, create shipment, track, update |
| 5.6 | CI/CD | GitHub Actions: lint, typecheck, test, deploy |
| 5.7 | Production DB | Neon/Supabase PostgreSQL provisioning |
| 5.8 | Deploy | Vercel production + environment variables |
| 5.9 | Documentation | Admin user guide, API docs |
| 5.10 | Monitoring | Error tracking (Sentry optional) |

### Acceptance Criteria

- Production URL live with SSL
- All E2E tests pass
- No critical security findings
- Admin can operate full workflow without developer assistance

---

## Post-MVP Backlog (Phase 6+)

| Feature | Priority | Notes |
|---------|----------|-------|
| Email notifications | High | Status change alerts to customers |
| SMS tracking updates | High | Indonesia SMS gateway integration |
| Customer portal | Medium | Self-service login for business customers |
| Barcode/label printing | Medium | PDF labels with tracking QR |
| Real-time map tracking | Medium | Mapbox/Google Maps live vehicle position |
| Multi-language (ID/EN) | Medium | next-intl i18n |
| OAuth SSO | Low | Google Workspace for staff |
| Webhook API | Low | Third-party integrations |
| Mobile app | Low | React Native or PWA |
| Invoice/billing module | Low | Payment integration |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | High | Strict phase gates; MVP = Phases 1–5 only |
| RBAC complexity | Medium | Centralize in `permissions.ts`; test per role |
| Tracking number collisions | Low | Atomic DB sequence per year |
| CMS content drift | Medium | Seed defaults; validate required blocks on deploy |
| Performance at scale | Medium | Indexes defined in schema; pagination everywhere |

---

## Team Allocation (Suggested)

| Role | Phases | Focus |
|------|--------|-------|
| Full-stack lead | 1–5 | Architecture, auth, services, deploy |
| Frontend dev | 3–4 | Public site + dashboard UI |
| Backend dev | 2, 4 | API, services, data layer |
| Designer | 3 | Brand assets, final polish (optional if using design system) |

---

## Definition of Done (MVP)

- [ ] Public website live with 5 pages + tracking
- [ ] Admin dashboard with all 11 modules functional
- [ ] 4 roles with correct access control
- [ ] PostgreSQL with full schema deployed
- [ ] Dark mode + responsive on all surfaces
- [ ] SEO metadata and sitemap
- [ ] Export PDF/Excel working
- [ ] Seeded demo data for sales demos
- [ ] Deployed to production URL

---

## Next Action

**Start Phase 1** when ready:

```bash
# From project root
cd idm
npx create-next-app@latest . --typescript --tailwind --app --src-dir
# Then follow Phase 1 task list
```

Say **"Start Phase 1"** to begin scaffolding the application.
