import { getCurrentSession } from "@/domains/auth/use-cases/get-current-session";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/login");

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-background px-4 py-16">
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(17,24,39,0.04)_1px,transparent_1px)] [background-size:28px_28px] dark:[background-image:radial-gradient(rgba(226,232,240,0.04)_1px,transparent_1px)]" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-[1.6rem] border border-border bg-panel-strong shadow-[0_24px_72px_rgba(2,8,23,0.12)]">
          <div className="h-1 w-full bg-gradient-to-r from-accent/30 via-accent/70 to-accent/30" />

          <div className="px-8 py-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                <Building2 size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  Créer votre organisation
                </h1>
                <p className="text-sm text-muted-foreground">
                  Bienvenue, {session.user.fullName.split(" ")[0]}
                </p>
              </div>
            </div>

            <p className="mb-6 text-sm leading-6 text-muted-foreground">
              Votre espace regroupe vos dossiers de vérification, vos règles de
              scoring et vos collaborateurs. Vous pourrez inviter votre équipe
              juste après.
            </p>

            <OnboardingForm />
          </div>
        </div>
      </div>
    </main>
  );
}
