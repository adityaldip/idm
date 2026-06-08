import { COMPANY } from "@/lib/company";

export const COMPANY_NAME = COMPANY.name;
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const PUBLIC_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/berita", label: "Berita" },
  { href: "/tracking", label: "Tracking" },
  { href: "/contact", label: "Contact" },
] as const;

export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/shipments",
  "/customers",
  "/branches",
  "/fleet",
  "/news",
  "/testimonials",
  "/offerings",
  "/partners",
  "/content",
  "/inbox",
  "/users",
  "/settings",
] as const;

export const DASHBOARD_NAV_ICONS = [
  "LayoutDashboard",
  "Package",
  "Users",
  "Building2",
  "Truck",
  "Contact",
  "Newspaper",
  "MessageSquare",
  "Briefcase",
  "Handshake",
  "FileText",
  "Inbox",
  "UserCog",
  "Settings",
] as const;

export type DashboardNavIcon = (typeof DASHBOARD_NAV_ICONS)[number];

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: DashboardNavIcon;
};

export type DashboardNavGroup = {
  label: string;
  items: readonly DashboardNavItem[];
};

export const DASHBOARD_NAV_GROUPS: readonly DashboardNavGroup[] = [
  {
    label: "Operations",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
      { href: "/shipments", label: "Shipments", icon: "Package" },
      { href: "/customers", label: "Customers", icon: "Users" },
      { href: "/branches", label: "Branches", icon: "Building2" },
    ],
  },
  {
    label: "Fleet",
    items: [
      { href: "/fleet/vehicles", label: "Vehicles", icon: "Truck" },
      { href: "/fleet/drivers", label: "Drivers", icon: "Contact" },
    ],
  },
  {
    label: "Web Portal",
    items: [
      { href: "/news", label: "News", icon: "Newspaper" },
      { href: "/testimonials", label: "Testimonials", icon: "MessageSquare" },
      { href: "/offerings", label: "Services", icon: "Briefcase" },
      { href: "/partners", label: "Partners", icon: "Handshake" },
      { href: "/content", label: "Content", icon: "FileText" },
      { href: "/inbox", label: "Inbox", icon: "Inbox" },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/users", label: "Users", icon: "UserCog" },
      { href: "/settings", label: "Settings", icon: "Settings" },
    ],
  },
];

/** @deprecated Use DASHBOARD_NAV_GROUPS */
export const DASHBOARD_NAV = DASHBOARD_NAV_GROUPS.flatMap((g) => g.items);

export const CONTENT_BLOCK_LABELS: Record<string, string> = {
  HERO: "Home Hero",
  ABOUT: "About Section",
  SERVICES_INTRO: "Services Intro",
  COVERAGE: "Coverage",
  CTA: "Call to Action",
  FOOTER: "Footer",
};

export const NEWS_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  OPERATOR: "Operator",
  CUSTOMER_SERVICE: "Customer Service",
};

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  PICKED_UP: "Picked Up",
  IN_WAREHOUSE: "In Warehouse",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
  RETURNED: "Returned",
};

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  EXPRESS: "Express",
  STANDARD: "Standard",
  FREIGHT: "Freight",
  COLD_CHAIN: "Cold Chain",
  LAST_MILE: "Last Mile",
  INTERNATIONAL: "International",
};
