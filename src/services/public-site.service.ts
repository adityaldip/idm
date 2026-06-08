import { cache } from "react";
import type { ContentBlockType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  COMPANY,
  COMPANY_PROFILE,
  VISION_MISSION,
  SERVICES,
  PARTNERS,
  OFFERINGS,
  WHY_CHOOSE_US,
  COMPANY_STATS,
  COVERAGE_REGIONS,
} from "@/lib/company";

export const getSettingsMap = cache(async () => {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

export const getContentBlock = cache(async (type: ContentBlockType) => {
  return prisma.contentBlock.findUnique({ where: { type } });
});

export const getPublicBranding = cache(async () => {
  const settings = await getSettingsMap();
  return {
    name: settings.company_name ?? COMPANY.name,
    legalName: settings.company_name ?? COMPANY.legalName,
    tagline: settings.company_tagline ?? COMPANY.tagline,
    email: settings.company_email ?? COMPANY.email,
    phone: settings.company_phone ?? COMPANY.phone,
    address: settings.company_address ?? COMPANY.address.full,
    founded: settings.company_founded ?? String(COMPANY.foundedYear),
    hours: COMPANY.hours,
    website: COMPANY.website,
    phoneHref: COMPANY.phoneHref,
    profileShort: COMPANY_PROFILE.short,
  };
});

export const getPublicOfferings = cache(async () => {
  const items = await prisma.serviceOffering.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  if (items.length === 0) {
    return SERVICES.map((s) => ({
      id: s.slug,
      slug: s.slug,
      name: s.name,
      description: s.description,
      icon: s.icon,
      features: [...s.features],
    }));
  }
  return items.map((o) => ({
    id: o.id,
    slug: o.slug,
    name: o.name,
    description: o.description,
    icon: o.icon ?? "Truck",
    features: o.features,
  }));
});

export const getPublicPartners = cache(async () => {
  const items = await prisma.partner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  if (items.length === 0) {
    return PARTNERS.map((p) => ({
      id: p.name,
      name: p.name,
      logoUrl: p.logo,
      website: null as string | null,
    }));
  }
  return items.map((p) => ({
    id: p.id,
    name: p.name,
    logoUrl: p.logoUrl,
    website: p.website,
  }));
});

export const getPublicTestimonials = cache(async () => {
  return prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 12,
  });
});

export const getPublicBranches = cache(async () => {
  const items = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: [{ isHeadquarters: "desc" }, { name: "asc" }],
  });
  if (items.length === 0) {
    return [];
  }
  return items.map((b) => ({
    id: b.id,
    name: b.name,
    address: [b.address, b.city, b.province, b.postalCode]
      .filter(Boolean)
      .join(", "),
    phone: b.phone ?? "",
    isHeadquarters: b.isHeadquarters,
  }));
});

export const getPublicCoverage = cache(async () => {
  const areas = await prisma.coverageArea.findMany({
    orderBy: { province: "asc" },
  });
  if (areas.length === 0) {
    return [...COVERAGE_REGIONS];
  }
  return areas.flatMap((a) => a.cities.length > 0 ? a.cities : [a.province]);
});

export const getPublishedNews = cache(async (limit = 20) => {
  return prisma.news.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
});

export const getPublishedNewsBySlug = cache(async (slug: string) => {
  return prisma.news.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { author: { select: { name: true } } },
  });
});

export const getPublicHomeContent = cache(async () => {
  const [branding, hero, cta, coverage, offerings, partners, testimonials] =
    await Promise.all([
      getPublicBranding(),
      getContentBlock("HERO"),
      getContentBlock("CTA"),
      getContentBlock("COVERAGE"),
      getPublicOfferings(),
      getPublicPartners(),
      getPublicTestimonials(),
    ]);

  const offeringsIntro = await getContentBlock("SERVICES_INTRO");
  const metadata = (hero?.metadata ?? {}) as Record<string, unknown>;
  const offeringsList =
    (offeringsIntro?.metadata as { items?: string[] } | null)?.items ??
    [...OFFERINGS];

  return {
    branding,
    hero: {
      title: hero?.title ?? branding.legalName,
      subtitle: hero?.subtitle ?? branding.tagline,
      body: hero?.body ?? branding.profileShort,
      ctaPrimary: String(metadata.ctaPrimary ?? "Track Shipment"),
      ctaSecondary: String(metadata.ctaSecondary ?? "Layanan Kami"),
    },
    cta: {
      title: cta?.title ?? "100% Aman dan Terpercaya",
      subtitle:
        cta?.subtitle ??
        "Kami menyediakan jasa ekspedisi yang cepat, aman, dan terpercaya.",
    },
    coverage: {
      title: coverage?.title ?? "Jangkauan Se-Indonesia",
      body:
        coverage?.body ??
        "Beroperasi di lebih dari 40 kota di seluruh Indonesia dengan layanan terintegrasi dan kualitas terbaik.",
    },
    offeringsIntro: {
      title: offeringsIntro?.title ?? "Apa Yang Kami Tawarkan",
      description:
        offeringsIntro?.subtitle ??
        "Nilai tambah untuk bisnis Anda dengan layanan pengiriman yang handal.",
      items: offeringsList,
    },
    vision: VISION_MISSION.vision,
    mission: VISION_MISSION.mission,
    stats: COMPANY_STATS,
    whyChooseUs: WHY_CHOOSE_US,
    offerings,
    partners,
    testimonials,
  };
});

export const getPublicAboutContent = cache(async () => {
  const [branding, about] = await Promise.all([
    getPublicBranding(),
    getContentBlock("ABOUT"),
  ]);

  return {
    branding,
    title: about?.title ?? branding.legalName,
    subtitle: about?.subtitle ?? `Berdiri sejak ${branding.founded}`,
    history: about?.body ?? COMPANY_PROFILE.history,
    short: COMPANY_PROFILE.short,
    about: COMPANY_PROFILE.about,
    whyUs: COMPANY_PROFILE.whyUs,
    vision: VISION_MISSION.vision,
    mission: VISION_MISSION.mission,
    foundedDate: COMPANY.foundedDate,
    rebrandYear: COMPANY.rebrandYear,
  };
});
