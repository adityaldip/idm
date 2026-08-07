/**
 * Shipped marketing photography. Files live in `public/images/site/` — see the
 * README there for sources and licensing before swapping any of them out.
 */

const BASE = "/images/site";

export const PAGE_HERO_IMAGES = {
  about: `${BASE}/hero-about.jpg`,
  services: `${BASE}/hero-services.jpg`,
  contact: `${BASE}/hero-contact.jpg`,
  berita: `${BASE}/hero-berita.jpg`,
} as const;

export const ABOUT_WAREHOUSE_IMAGE = `${BASE}/about-warehouse.jpg`;

/** Preferred photo per seeded offering slug. */
const SERVICE_IMAGE_BY_SLUG: Record<string, string> = {
  "domestic-distribution": `${BASE}/service-domestic-distribution.jpg`,
  express: `${BASE}/service-express.jpg`,
  "ocean-freight": `${BASE}/service-ocean-freight.jpg`,
  standard: `${BASE}/service-standard.jpg`,
  freight: `${BASE}/service-freight.jpg`,
  "project-cargo": `${BASE}/service-project-cargo.jpg`,
  "air-freight": `${BASE}/service-air-freight.jpg`,
};

/** Fallback by icon so an offering added later still gets a sensible photo. */
const SERVICE_IMAGE_BY_ICON: Record<string, string> = {
  Truck: `${BASE}/service-domestic-distribution.jpg`,
  Ship: `${BASE}/service-ocean-freight.jpg`,
  Plane: `${BASE}/service-air-freight.jpg`,
  Container: `${BASE}/service-project-cargo.jpg`,
  Zap: `${BASE}/service-express.jpg`,
  Package: `${BASE}/service-standard.jpg`,
};

/**
 * Photo for a service card. Returns null for an unknown slug/icon pair so the
 * card falls back to its icon-only header rather than a broken image.
 */
export function getServiceImage(slug: string, icon?: string | null) {
  return (
    SERVICE_IMAGE_BY_SLUG[slug] ??
    (icon ? SERVICE_IMAGE_BY_ICON[icon] : undefined) ??
    null
  );
}
