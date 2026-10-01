import Link from "next/link";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
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
    <footer className="section-navy relative overflow-hidden text-white">
      {/* Gold accent rule along the top edge */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
      <div className="hero-contours absolute inset-0 opacity-50" />
      <div className="hero-grain pointer-events-none absolute inset-0" />
      {/* Dot-matrix Indonesia (public/indonesia-dots.svg) echoing the hero map */}
      <div
        className="pointer-events-none absolute right-[-6%] bottom-6 aspect-[1200/460] w-[90%] bg-[url(/indonesia-dots.svg)] bg-contain bg-no-repeat opacity-[0.08] md:w-[70%]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-8 md:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo size="xl" className="[&_span]:text-white [&_span:last-child]:text-white/70" />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
              {branding.profileShort}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold">
              Navigasi
            </h3>
            <ul className="mt-5 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"
                  >
                    <span className="h-px w-3 bg-gold/60 transition-all duration-300 group-hover:w-5 group-hover:bg-gold" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold">
              Kontak
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-white/80">
              {hq && (
                <li className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/30">
                    <MapPin className="size-4" />
                  </span>
                  <span className="pt-1">{hq.address}</span>
                </li>
              )}
              <li>
                <a
                  href={`tel:${branding.phoneHref}`}
                  className="flex items-center gap-3 transition-colors hover:text-white"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/30">
                    <Phone className="size-4" />
                  </span>
                  {branding.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${branding.email}`}
                  className="flex items-center gap-3 break-all transition-colors hover:text-white"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/30">
                    <Mail className="size-4" />
                  </span>
                  {branding.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 text-sm text-white/60 sm:flex-row">
          <p>
            © {year}{" "}
            <a
              href={branding.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/85 hover:text-white"
            >
              {branding.name}
            </a>
            . All rights reserved.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-gold"
          >
            Kembali ke atas
            <ArrowUp className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
