import type { ReactNode } from "react";
import { FileCheck2, ShieldCheck, Users } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Vérification en 3 minutes",
    body: "CNI + selfie analysés par Smile ID. Résultat vert / orange / rouge immédiat.",
  },
  {
    icon: FileCheck2,
    title: "Conformité BCEAO & ARDP",
    body: "Audit trail horodaté, consentement biométrique, export PDF prêt pour tout contrôle réglementaire.",
  },
  {
    icon: Users,
    title: "Zéro doublon, zéro fraude",
    body: "Smile Secure détecte les identités déjà vérifiées sur la plateforme avant tout décaissement.",
  },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-dvh items-start justify-center bg-background px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:items-center lg:py-12">
      {/* Subtle dot grid */}
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(17,24,39,0.04)_1px,transparent_1px)] [background-size:28px_28px] dark:[background-image:radial-gradient(rgba(226,232,240,0.04)_1px,transparent_1px)]" />

      <div className="relative w-full max-w-[900px]">
        <div className="md:grid md:min-h-[580px] md:grid-cols-2 md:overflow-hidden md:rounded-[1.6rem] md:border md:border-border md:bg-panel-strong md:shadow-[0_24px_72px_rgba(2,8,23,0.14)]">

          {/* ── Aside gauche ── */}
          <section className="hidden flex-col justify-between bg-sidebar px-8 py-10 text-sidebar-foreground md:flex lg:px-10 lg:py-12">
            <div>
              {/* Logo */}
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-[0.85rem] font-bold text-white">
                  Id
                </div>
                <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
                  Identis
                </span>
              </div>

              <h1 className="mt-8 text-xl font-semibold leading-snug tracking-tight text-sidebar-foreground lg:text-[1.3rem]">
                Vérifiez l&apos;identité de vos clients en toute confiance
              </h1>
              <p className="mt-3 max-w-xs text-[0.82rem] leading-[1.7] text-sidebar-foreground/55">
                La plateforme KYC pensée pour les fintechs, IMF et agences immobilières d&apos;Afrique francophone.
              </p>
            </div>

            <div className="mt-10 grid gap-2.5">
              {FEATURES.map(({ icon: Icon, title: featureTitle, body }) => (
                <div
                  key={featureTitle}
                  className="flex items-start gap-3 rounded-xl border border-sidebar-border/40 bg-sidebar-foreground/[0.04] px-4 py-3"
                >
                  <Icon className="mt-0.5 size-[15px] shrink-0 text-[#3b82f6]" />
                  <div>
                    <p className="text-[0.8rem] font-semibold leading-snug text-sidebar-foreground">
                      {featureTitle}
                    </p>
                    <p className="mt-0.5 text-[0.73rem] leading-[1.6] text-sidebar-foreground/50">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 border-t border-sidebar-border/30 pt-5 text-[0.68rem] text-sidebar-foreground/30">
              Données chiffrées AES-256 · Hébergement Europe · Conformité ARTCI
            </p>
          </section>

          {/* ── Formulaire droite ── */}
          <section className="flex flex-col justify-center md:px-8 md:py-10 lg:px-10">
            <div className="mx-auto w-full max-w-sm">
              {/* Branding mobile uniquement */}
              <div className="mb-7 flex items-center gap-2 md:hidden">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#2563eb] text-[0.75rem] font-bold text-white">
                  Id
                </div>
                <span className="text-sm font-bold tracking-tight text-foreground">
                  Identis
                </span>
              </div>

              <h2 className="text-[1.4rem] font-semibold tracking-tight text-foreground">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {subtitle}
              </p>

              <div className="mt-8">{children}</div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
