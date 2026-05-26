import { AuthShell } from "../components/auth-shell";
import { RegisterForm } from "../components/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Ouvrez votre workspace et démarrez vos vérifications d'identité."
    >
      <RegisterForm />
    </AuthShell>
  );
}
