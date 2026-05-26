import { AuthShell } from "../components/auth-shell";
import { LoginForm } from "../components/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Connexion"
      subtitle="Connectez-vous pour accéder à votre espace Identis."
    >
      <LoginForm />
    </AuthShell>
  );
}
