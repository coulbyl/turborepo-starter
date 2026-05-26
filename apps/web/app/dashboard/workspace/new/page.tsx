import { getCurrentSession } from "@/domains/auth/use-cases/get-current-session";
import { redirect } from "next/navigation";
import { NewWorkspaceForm } from "./components/new-workspace-form";

export default async function NewWorkspacePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/login");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2563eb] text-[0.85rem] font-bold text-white">
            Id
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">
            Identis
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Créer votre workspace
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Un workspace regroupe tous vos dossiers, membres et configurations.
          Vous pourrez en créer d&apos;autres plus tard.
        </p>

        <div className="mt-8">
          <NewWorkspaceForm />
        </div>
      </div>
    </main>
  );
}
