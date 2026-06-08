import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/shipments",
          "/customers",
          "/branches",
          "/fleet",
          "/testimonials",
          "/content",
          "/offerings",
          "/partners",
          "/inbox",
          "/users",
          "/settings",
          "/login",
          "/api",
          "/unauthorized",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
