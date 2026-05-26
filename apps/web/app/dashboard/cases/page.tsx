import Link from "next/link";
import { Plus } from "lucide-react";
import { CasesListClient } from "./components/cases-list-client";

export default function CasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Dossiers
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Toutes les vérifications d&apos;identité de votre workspace.
          </p>
        </div>
        <Link
          href="/dashboard/cases/new"
          className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={14} />
          Nouveau dossier
        </Link>
      </div>

      <CasesListClient />
    </div>
  );
}
