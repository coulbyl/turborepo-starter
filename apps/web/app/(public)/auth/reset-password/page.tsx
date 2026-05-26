import { Suspense } from "react";
import { AuthShell } from "../components/auth-shell";
import { ResetPasswordForm } from "./components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe solide d'au moins 8 caractères."
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
