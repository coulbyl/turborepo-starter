import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@identis/ui/components/button";
import { PageHeader } from "@/components/page-header";
import { CasesListClient } from "./components/cases-list-client";

export default function CasesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Dossiers"
        description="Toutes les vérifications d'identité de votre workspace."
        action={
          <Button asChild>
            <Link href="/dashboard/cases/new">
              <Plus size={14} />
              Nouveau dossier
            </Link>
          </Button>
        }
      />
      <CasesListClient />
    </div>
  );
}
