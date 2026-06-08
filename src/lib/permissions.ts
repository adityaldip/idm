import type { Role } from "@prisma/client";

export type Permission =
  | "dashboard:view"
  | "shipments:read"
  | "shipments:write"
  | "tracking:write"
  | "customers:read"
  | "customers:write"
  | "branches:read"
  | "branches:write"
  | "fleet:read"
  | "fleet:write"
  | "news:read"
  | "news:write"
  | "testimonials:read"
  | "testimonials:write"
  | "content:read"
  | "content:write"
  | "users:read"
  | "users:write"
  | "settings:read"
  | "settings:write"
  | "export:generate";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "dashboard:view",
    "shipments:read",
    "shipments:write",
    "tracking:write",
    "customers:read",
    "customers:write",
    "branches:read",
    "branches:write",
    "fleet:read",
    "fleet:write",
    "news:read",
    "news:write",
    "testimonials:read",
    "testimonials:write",
    "content:read",
    "content:write",
    "users:read",
    "users:write",
    "settings:read",
    "settings:write",
    "export:generate",
  ],
  ADMIN: [
    "dashboard:view",
    "shipments:read",
    "shipments:write",
    "tracking:write",
    "customers:read",
    "customers:write",
    "branches:read",
    "branches:write",
    "fleet:read",
    "fleet:write",
    "news:read",
    "news:write",
    "testimonials:read",
    "testimonials:write",
    "content:read",
    "content:write",
    "export:generate",
  ],
  OPERATOR: [
    "dashboard:view",
    "shipments:read",
    "shipments:write",
    "tracking:write",
    "customers:read",
    "export:generate",
  ],
  CUSTOMER_SERVICE: [
    "dashboard:view",
    "shipments:read",
    "tracking:write",
    "customers:read",
    "customers:write",
    "content:read",
    "export:generate",
  ],
};

const ROUTE_PERMISSIONS: Record<string, Permission> = {
  "/dashboard": "dashboard:view",
  "/shipments": "shipments:read",
  "/customers": "customers:read",
  "/branches": "branches:read",
  "/fleet": "fleet:read",
  "/news": "news:read",
  "/testimonials": "testimonials:read",
  "/content": "content:read",
  "/offerings": "content:read",
  "/partners": "content:read",
  "/inbox": "content:read",
  "/users": "users:read",
  "/settings": "settings:read",
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAccessRoute(role: Role, pathname: string): boolean {
  const matchedPrefix = Object.keys(ROUTE_PERMISSIONS).find((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!matchedPrefix) return true;

  const permission = ROUTE_PERMISSIONS[matchedPrefix];
  return hasPermission(role, permission);
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
