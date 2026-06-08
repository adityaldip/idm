import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/marketing/contact-form";
import { PageHero } from "@/components/marketing/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPublicBranding,
  getPublicBranches,
} from "@/services/public-site.service";
import { BRANCHES, COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "Kontak Kami",
  description: "Hubungi PT Intan Daya Mandiri — Semarang & Bekasi.",
};

export default async function ContactPage() {
  const [branding, dbBranches] = await Promise.all([
    getPublicBranding(),
    getPublicBranches(),
  ]);

  const branches =
    dbBranches.length > 0
      ? dbBranches
      : BRANCHES.map((b, i) => ({
          id: String(i),
          name: b.name,
          address: b.address,
          phone: b.phone,
          isHeadquarters: b.isHeadquarters,
        }));

  return (
    <>
      <PageHero
        eyebrow="Hubungi Kami"
        title="Kontak Kami"
        description="Butuh bantuan? Kirim pesan melalui formulir di bawah atau hubungi kantor kami langsung."
      />

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <Card className="overflow-hidden border-border/60 shadow-md lg:col-span-3">
            <div className="h-1.5 bg-gradient-to-r from-primary to-gold" />
            <CardContent className="p-8">
              <h2 className="font-heading text-xl font-semibold">
                Kirim Pesan
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tim kami akan merespons secepatnya.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5 lg:col-span-2">
            {branches.map((branch) => (
              <Card
                key={branch.id}
                className="card-hover overflow-hidden border-border/60"
              >
                <div
                  className={
                    branch.isHeadquarters
                      ? "h-1 bg-gradient-to-r from-gold to-gold-dark"
                      : "h-1 bg-primary/60"
                  }
                />
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <h2 className="font-heading font-semibold">
                        {branch.name}
                        {branch.isHeadquarters && (
                          <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-medium text-secondary">
                            Pusat
                          </span>
                        )}
                      </h2>
                      <address className="mt-2 not-italic text-sm leading-relaxed text-muted-foreground">
                        {branch.address}
                      </address>
                      {branch.phone && (
                        <a
                          href={`tel:${branch.phone.replace(/\D/g, "")}`}
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          <Phone className="size-3.5" />
                          {branch.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="overflow-hidden border-border/60 bg-muted/30">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-heading font-semibold">Email</h2>
                    <a
                      href={`mailto:${branding.email}`}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {branding.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-border/60 pt-5">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gold/15 text-secondary">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-heading font-semibold">
                      Jam Operasional
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {branding.hours ?? COMPANY.hours}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
