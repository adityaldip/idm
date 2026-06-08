# IDM Design System

> UI/UX specification for PT Intan Daya Mandiri — 2026 Enterprise Logistics Aesthetic

---

## 1. Design Philosophy

IDM's visual language combines **corporate trust** (DHL/FedEx heritage) with **modern SaaS polish** (glass surfaces, soft motion, generous whitespace). The public site feels premium and approachable; the dashboard feels powerful and efficient.

**Keywords:** Reliable · Nationwide · Premium · Efficient · Transparent

---

## 2. Color Palette

### 2.1 Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#0F4C81` | Headers, CTAs, nav, links, dashboard accents |
| `--primary-foreground` | `#FFFFFF` | Text on primary surfaces |
| `--primary-muted` | `#0F4C81` @ 10% | Subtle backgrounds, badges |
| `--secondary` | `#FF7A00` | Highlights, status accents, hover CTAs |
| `--secondary-foreground` | `#FFFFFF` | Text on secondary surfaces |

### 2.2 Extended Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `#FAFBFC` | `#0A0F14` | Page background |
| `--foreground` | `#0F172A` | `#F1F5F9` | Primary text |
| `--card` | `#FFFFFF` @ 80% | `#111827` @ 80% | Glass cards |
| `--card-foreground` | `#0F172A` | `#F1F5F9` | Card text |
| `--muted` | `#F1F5F9` | `#1E293B` | Secondary surfaces |
| `--muted-foreground` | `#64748B` | `#94A3B8` | Captions, labels |
| `--border` | `#E2E8F0` | `#1E293B` | Dividers, inputs |
| `--ring` | `#0F4C81` | `#3B82F6` | Focus rings |

### 2.3 Semantic Colors

| Status | Color | Background |
|--------|-------|------------|
| Created | `#64748B` | `#F1F5F9` |
| Picked Up | `#3B82F6` | `#EFF6FF` |
| In Warehouse | `#8B5CF6` | `#F5F3FF` |
| In Transit | `#0F4C81` | `#E0F2FE` |
| Out For Delivery | `#FF7A00` | `#FFF7ED` |
| Delivered | `#10B981` | `#ECFDF5` |
| Returned | `#EF4444` | `#FEF2F2` |

### 2.4 Gradients

```css
/* Hero gradient — public pages */
--gradient-hero: linear-gradient(135deg, #0F4C81 0%, #1A6BB5 50%, #0A3A66 100%);

/* Accent gradient — CTAs, highlights */
--gradient-accent: linear-gradient(135deg, #FF7A00 0%, #FF9A40 100%);

/* Glass overlay */
--gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
```

---

## 3. Typography

### 3.1 Font Stack

| Role | Font | Fallback | Weight Range |
|------|------|----------|--------------|
| **Display / Headings** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | system-ui, sans-serif | 600–800 |
| **Body** | [Inter](https://fonts.google.com/specimen/Inter) | system-ui, sans-serif | 400–600 |
| **Monospace** | [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | monospace | 400–500 |

Load via `next/font/google` for zero layout shift.

### 3.2 Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display-xl` | 4.5rem / 72px | 1.1 | 800 | Hero headlines |
| `display-lg` | 3rem / 48px | 1.15 | 700 | Section titles |
| `heading-lg` | 2rem / 32px | 1.25 | 700 | Page titles |
| `heading-md` | 1.5rem / 24px | 1.3 | 600 | Card titles |
| `heading-sm` | 1.125rem / 18px | 1.4 | 600 | Subsections |
| `body-lg` | 1.125rem / 18px | 1.6 | 400 | Lead paragraphs |
| `body-md` | 1rem / 16px | 1.6 | 400 | Default body |
| `body-sm` | 0.875rem / 14px | 1.5 | 400 | Captions, table cells |
| `label` | 0.75rem / 12px | 1.4 | 500 | Badges, overlines |

### 3.3 Tracking Numbers

Always render in `JetBrains Mono` with letter-spacing `0.05em` for scannability:

```
IDM2026000042
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (Tailwind-compatible)

Base unit: **4px**

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-24` | 96px |

### 4.2 Container Widths

| Context | Max Width | Padding |
|---------|-----------|---------|
| Public content | `1280px` (`max-w-7xl`) | `px-4 md:px-6 lg:px-8` |
| Dashboard content | `1440px` | `p-6 lg:p-8` |
| Narrow forms | `640px` (`max-w-xl`) | centered |

### 4.3 Grid

- **Public services:** 1 → 2 → 3 columns (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- **Dashboard KPIs:** 2 → 4 columns
- **Data tables:** Full width with horizontal scroll on mobile

### 4.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Inputs, badges |
| `radius-md` | 10px | Buttons, cards |
| `radius-lg` | 16px | Modals, large cards |
| `radius-xl` | 24px | Hero panels, feature cards |
| `radius-full` | 9999px | Avatars, pills |

---

## 5. Glassmorphism

Core visual signature for 2026 IDM brand.

```css
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 4px 24px rgba(15, 76, 129, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Light mode variant */
.glass-card-light {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(15, 76, 129, 0.06);
}
```

**Usage:**
- Hero stat cards (public)
- Tracking result panel
- Dashboard KPI cards
- Sidebar in dark mode

---

## 6. Shadows & Elevation

| Level | Shadow | Usage |
|-------|--------|-------|
| `elevation-0` | none | Flat surfaces |
| `elevation-1` | `0 1px 3px rgba(0,0,0,0.06)` | Inputs |
| `elevation-2` | `0 4px 12px rgba(15,76,129,0.08)` | Cards |
| `elevation-3` | `0 8px 24px rgba(15,76,129,0.12)` | Dropdowns, popovers |
| `elevation-4` | `0 16px 48px rgba(15,76,129,0.16)` | Modals |

---

## 7. Motion (Framer Motion)

### 7.1 Principles

- **Purposeful** — motion guides attention, never decorates
- **Fast** — 200–400ms for UI; 600ms max for page transitions
- **Reduced motion** — respect `prefers-reduced-motion`

### 7.2 Presets

```typescript
// lib/motion.ts (planned)
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};
```

### 7.3 Component Animations

| Component | Animation |
|-----------|-----------|
| Hero headline | Staggered fade-in-up per word/line |
| Service cards | Stagger on scroll into view |
| Tracking timeline | Sequential node reveal |
| Dashboard KPIs | Count-up numbers on mount |
| Page transitions | Subtle fade between routes |
| Sidebar | Slide + opacity |

---

## 8. shadcn/ui Component Mapping

### 8.1 Public Site Components

| UI Need | shadcn Component |
|---------|------------------|
| Navigation | Custom header + `Sheet` (mobile menu) |
| Hero CTA | `Button` (primary + secondary variants) |
| Tracking input | `Input` + `Button` |
| Contact form | `Form` + `Input`, `Textarea`, `Select` |
| Testimonials | `Card` + `Avatar` |
| FAQ (future) | `Accordion` |
| Theme toggle | `DropdownMenu` or toggle button |

### 8.2 Dashboard Components

| UI Need | shadcn Component |
|---------|------------------|
| Sidebar nav | Custom + `ScrollArea` |
| Data tables | `Table` + `@tanstack/react-table` |
| Filters | `Select`, `Popover`, `DatePicker` |
| Forms | `Form` + Zod |
| Status badges | `Badge` (custom variants per status) |
| Charts wrapper | `Card` + Recharts |
| Confirmations | `AlertDialog` |
| Toasts | `Sonner` |
| User menu | `DropdownMenu` + `Avatar` |
| Modals | `Dialog` |

### 8.3 Custom Variants (Button)

```typescript
// Extend shadcn button variants
variants: {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  gradient: "bg-gradient-to-r from-primary to-[#1A6BB5] text-white",
  glass: "glass-card-light hover:bg-white/80",
  outline: "border-primary text-primary hover:bg-primary/5",
}
```

---

## 9. Page Patterns

### 9.1 Public — Home

```
┌────────────────────────────────────────────────────────────┐
│  [Logo]    Home  About  Services  Tracking  Contact  [☀] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ HERO GRADIENT ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│   "Delivering Excellence Across Indonesia"               │
│   [Track Shipment]  [Our Services]                       │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│   │ 50K+    │ │ 100+    │ │ 99.2%   │  ← glass stat cards │
│   │Shipments│ │ Cities  │ │ On-time │                     │
│   └─────────┘ └─────────┘ └─────────┘                     │
├────────────────────────────────────────────────────────────┤
│   SERVICES GRID (3-col)                                    │
├────────────────────────────────────────────────────────────┤
│   COVERAGE MAP / PROVINCE LIST                             │
├────────────────────────────────────────────────────────────┤
│   TESTIMONIALS CAROUSEL                                    │
├────────────────────────────────────────────────────────────┤
│   CTA BANNER — gradient accent                             │
├────────────────────────────────────────────────────────────┤
│   FOOTER — links, contact, social                          │
└────────────────────────────────────────────────────────────┘
```

### 9.2 Public — Tracking Result

```
┌────────────────────────────────────────────────────────────┐
│  Tracking: IDM2026000042                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  STATUS: IN TRANSIT          ETA: Jun 12, 2026       │  │
│  │  Current: Surabaya Hub                               │  │
│  │  ████████████░░░░░░░░  65%                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  TIMELINE (vertical, animated nodes)                       │
│  ● Jun 8  — Created — Jakarta                              │
│  ● Jun 8  — Picked Up — Jakarta                            │
│  ● Jun 9  — In Warehouse — Jakarta Hub                     │
│  ◉ Jun 10 — In Transit — Surabaya Hub  ← current           │
│  ○        — Out For Delivery                               │
│  ○        — Delivered                                      │
└────────────────────────────────────────────────────────────┘
```

### 9.3 Dashboard Layout

```
┌──────────┬─────────────────────────────────────────────────┐
│          │  [Search]              [Notifications] [Avatar] │
│  SIDEBAR ├─────────────────────────────────────────────────┤
│          │                                                 │
│ Dashboard│  KPI Cards (4-col)                              │
│ Shipments│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                   │
│ Customers│  │Rev │ │Ship│ │Del │ │Ret │                   │
│ Branches │  └────┘ └────┘ └────┘ └────┘                   │
│ Fleet    │                                                 │
│ News     │  ┌─────────────────┐ ┌─────────────────┐        │
│ Content  │  │ Revenue Chart   │ │ Shipment Chart  │        │
│ Users    │  └─────────────────┘ └─────────────────┘        │
│ Settings │                                                 │
│          │  Recent Activity Feed                             │
│          │  ┌─────────────────────────────────────────┐   │
│          │  │ Data Table with filters + export          │   │
│          │  └─────────────────────────────────────────┘   │
└──────────┴─────────────────────────────────────────────────┘
```

---

## 10. Responsive Breakpoints

| Breakpoint | Min Width | Behavior |
|------------|-----------|----------|
| `sm` | 640px | Stack → 2-col grids |
| `md` | 768px | Sidebar collapses to sheet |
| `lg` | 1024px | Full sidebar visible |
| `xl` | 1280px | Max container width |
| `2xl` | 1536px | Dashboard uses full width |

### Mobile Priorities

1. Tracking search — full-width input, prominent CTA
2. Dashboard — bottom nav or hamburger → sheet sidebar
3. Tables — card view fallback on `< md`
4. Charts — simplified single-series on mobile

---

## 11. Iconography

- **Library:** [Lucide React](https://lucide.dev) (shadcn default)
- **Size:** 16px (inline), 20px (nav), 24px (feature icons)
- **Stroke:** 1.5px default, 2px for emphasis

| Context | Icon |
|---------|------|
| Shipments | `Package` |
| Tracking | `MapPin` |
| Fleet | `Truck` |
| Branches | `Building2` |
| Analytics | `BarChart3` |
| Export | `Download` |

---

## 12. Logo & Brand Assets (placeholder spec)

| Asset | Spec |
|-------|------|
| Primary logo | SVG, horizontal, blue on light / white on dark |
| Icon mark | Stylized "IDM" monogram or package + arrow |
| Favicon | 32×32, 180×180 apple-touch |
| OG image | 1200×630, hero gradient + logo + tagline |

---

## 13. Accessibility

- WCAG 2.1 AA contrast minimum (4.5:1 body text)
- Focus visible on all interactive elements (`ring-2 ring-ring`)
- Skip-to-content link on public pages
- ARIA labels on icon-only buttons
- Status communicated by text + color (not color alone)
- Form errors linked via `aria-describedby`

---

## 14. Tailwind CSS Variables (`globals.css` sketch)

```css
@layer base {
  :root {
    --primary: 207 79% 28%;          /* #0F4C81 in HSL */
    --primary-foreground: 0 0% 100%;
    --secondary: 28 100% 50%;        /* #FF7A00 */
    --secondary-foreground: 0 0% 100%;
    --background: 210 20% 98%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --border: 214 32% 91%;
    --ring: 207 79% 28%;
    --radius: 0.625rem;
  }

  .dark {
    --background: 210 25% 6%;
    --foreground: 210 40% 96%;
    --card: 222 47% 11%;
    --card-foreground: 210 40% 96%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --border: 217 33% 17%;
  }
}
```

---

*Implementation: Phase 1 scaffolds Tailwind + shadcn with these tokens. Phase 3 applies to public pages; Phase 4 to dashboard.*
