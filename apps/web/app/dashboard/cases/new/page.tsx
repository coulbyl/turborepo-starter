import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@identis/ui/components/button";
import { PageHeader } from "@/components/page-header";
import { NewCaseForm } from "./components/new-case-form";

export default function NewCasePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2 text-muted-foreground">
          <Link href="/dashboard/cases">
            <ArrowLeft size={13} />
            Retour aux dossiers
          </Link>
        </Button>
        <PageHeader
          title="Nouveau dossier"
          description="Identité du sujet + documents. Le résultat arrive en quelques minutes."
        />
      </div>
      <div className="mx-auto w-full max-w-2xl">
        <NewCaseForm />
      </div>
    </div>
  );
}
