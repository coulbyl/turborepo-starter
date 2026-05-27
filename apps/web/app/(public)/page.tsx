import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  GitBranch,
  ShieldCheck,
  Sliders,
  Users,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Vérification KYC en 3 minutes",
    body: "CNI + selfie analysés par Smile ID. Résultat biométrique vert / orange / rouge en temps réel, sans intervention manuelle.",
  },
  {
    icon: Sliders,
    title: "Rule Engine configurable",
    body: "Définissez vos propres règles de scoring (0–100) selon votre contexte BCEAO. Simulation avant mise en production.",
  },
  {
    icon: GitBranch,
    title: "Workflow multi-étapes",
    body: "Pipeline de validation configurable avec rôles, délais et escalade automatique. Chaque décision est tracée.",
  },
  {
    icon: Users,
    title: "Détection de doublons",
    body: "Smile Secure compare chaque visage aux dossiers existants. Zéro emprunt multiple, zéro faux profil.",
  },
  {
    icon: FileCheck2,
    title: "Conformité BCEAO & ARDP",
    body: "Audit trail horodaté, consentement biométrique explicite, export PDF prêt pour tout contrôle réglementaire.",
  },
  {
    icon: Zap,
    title: "Intégration API en quelques heures",
    body: "API REST documentée, webhooks sur chaque événement, SDK Node.js. Sandbox gratuite pour tester avant production.",
  },
];

const SEGMENTS = [
  {
    label: "Fintechs agréées BCEAO",
    desc: "Obligation KYC réglementaire, liste grise GAFI, onboarding digital.",
  },
  {
    label: "IMF / Microfinance",
    desc: "Détection doublons emprunteurs, fraude dossiers, processus manuels à digitiser.",
  },
  {
    label: "Agences immobilières",
    desc: "Vérification candidats locataires à distance, zéro faux document.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-[0.85rem] font-bold text-white">
              Id
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">
              Identis
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Démarrer <ArrowRight size={13} />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-28">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#2563eb]/20 bg-[#2563eb]/8 px-3.5 py-1 text-[0.72rem] font-semibold uppercase tracking-widest text-[#2563eb]">
            Plateforme KYC · Afrique francophone
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
            Vérifiez l&apos;identité de vos clients{" "}
            <span className="text-[#2563eb]">en toute confiance</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-[1.05rem]">
            Identis permet à toute organisation — fintech, IMF, agence
            immobilière — de vérifier une identité en quelques secondes, scorer
            le risque automatiquement et valider les dossiers via un workflow
            configurable. Conforme BCEAO et ARDP.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-8 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 sm:w-auto"
            >
              Créer mon compte <ArrowRight size={14} />
            </Link>
            <Link
              href="/auth/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground sm:w-auto"
            >
              Se connecter
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground/50">
            Compte · Organisation · Dashboard — en moins de 5 minutes
          </p>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="border-t border-border/60 bg-panel py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Tout ce dont votre équipe a besoin
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Du screening terrain à la validation compliance, en passant par
              l&apos;intégration API.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-panel-strong p-5"
              >
                <div className="mb-3.5 flex size-9 items-center justify-center rounded-lg bg-[#2563eb]/10">
                  <Icon size={17} className="text-[#2563eb]" />
                </div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1.5 text-[0.8rem] leading-[1.7] text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Segments ────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Conçu pour votre secteur
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {SEGMENTS.map(({ label, desc }) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-panel-strong p-6"
              >
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-2 text-[0.8rem] leading-[1.7] text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Deployment modes ────────────────────────────────────────── */}
      <section className="border-t border-border/60 bg-panel py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Deux modes de déploiement
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Cloud */}
            <div className="rounded-2xl border border-border bg-panel-strong p-7">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#2563eb]">
                Cloud
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                SaaS multi-tenant
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Démarrez en 5 minutes. Wallet prépayé à la vérification (500–1
                800 FCFA). Paiement Wave CI et Orange Money.
              </p>
              <ul className="mt-5 space-y-2 text-[0.82rem] text-muted-foreground">
                {[
                  "Inscription 15 000 FCFA",
                  "10 vérifications offertes",
                  "Dashboard + API + webhooks",
                  "Support inclus",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#2563eb]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="mt-7 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Créer mon compte <ArrowRight size={13} />
              </Link>
            </div>

            {/* Dedicated */}
            <div className="rounded-2xl border border-border bg-panel-strong p-7">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground/60">
                Dedicated
              </p>
              <p className="mt-2 text-xl font-bold text-foreground">
                Self-hosted sur votre infra
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Docker Compose sur vos serveurs. Données biométriques jamais
                transmises à Identis. Idéal pour les institutions financières.
              </p>
              <ul className="mt-5 space-y-2 text-[0.82rem] text-muted-foreground">
                {[
                  "Setup 150–300k FCFA",
                  "Licence mensuelle 75 000 FCFA",
                  "SLA 48h",
                  "Votre compte Smile ID",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:contact@identis.ci"
                className="mt-7 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ───────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Prêt à digitaliser votre processus KYC ?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Créez votre compte, configurez votre organisation, lancez votre
            première vérification — tout en moins de 5 minutes.
          </p>
          <Link
            href="/auth/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-8 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Créer mon compte <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-panel py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-[#2563eb] text-[0.7rem] font-bold text-white">
              Id
            </div>
            <span className="text-sm font-semibold text-foreground">
              Identis
            </span>
          </div>
          <p className="text-xs text-muted-foreground/40">
            © {new Date().getFullYear()} Identis · Abidjan, Côte d&apos;Ivoire ·
            Conformité BCEAO & ARDP
          </p>
        </div>
      </footer>
    </div>
  );
}
