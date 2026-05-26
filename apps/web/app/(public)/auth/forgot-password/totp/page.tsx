import { AuthShell } from "../../components/auth-shell";
import { ForgotPasswordTotpForm } from "./components/forgot-password-totp-form";

export default function ForgotPasswordTotpPage() {
  return (
    <AuthShell
      title="Réinitialiser le mot de passe"
      subtitle="Entrez votre identifiant et le code affiché dans votre application d'authentification (Google Authenticator, Authy…)."

    >
      <ForgotPasswordTotpForm />
    </AuthShell>
  );
}
