import { AuthShell } from "../components/auth-shell";
import { ForgotPasswordForm } from "./components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Récupérer l'accès"
      subtitle="Entrez votre email ou nom d'utilisateur. Si un compte correspond, vous recevrez un lien de réinitialisation."

    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
