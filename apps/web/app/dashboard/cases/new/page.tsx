import { NewCaseForm } from "./components/new-case-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewCasePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/cases"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={13} />
          Retour aux dossiers
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Nouveau dossier
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Identité du sujet + documents. Le résultat arrive en quelques minutes.
        </p>
      </div>

      <NewCaseForm />
    </div>
  );
}
