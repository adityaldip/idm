import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { PUBLIC_NAV as NAV } from "@/lib/constants";
import {
  getPublicBranding,
  getPublicBranches,
} from "@/services/public-site.service";

export async function PublicFooter() {
  const year = new Date().getFullYear();
  const [branding, branches] = await Promise.all([
    getPublicBranding(),
    getPublicBranches(),
  ]);
  const hq = branches.find((b) => b.isHeadquarters) ?? branches[0];

  return (
    <footer className="border-t-4 border-gold-dark bg-gold text-gold-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo size="xl" className="[&_span]:text-white [&_span:last-child]:text-white/70" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85">
              {branding.profileShort}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Navigasi
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Kontak
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/85">
              {hq && (
                <li className="flex gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-white/70" />
                  <span>{hq.address}</span>
                </li>
              )}
              <li>
                <a
                  href={`tel:${branding.phoneHref}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Phone className="size-4 text-white/70" />
                  {branding.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${branding.email}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-white"
                >
                  <Mail className="size-4 text-white/70" />
                  {branding.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/20 pt-6 text-center text-sm text-white/70">
          © {year}{" "}
          <a
            href={branding.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/90 hover:text-white"
          >
            {branding.name}
          </a>
          . All rights reserved.
        </div>
      </div>
    </footer>
  );
}
