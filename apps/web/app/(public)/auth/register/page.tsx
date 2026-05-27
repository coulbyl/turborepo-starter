import { AuthShell } from "../components/auth-shell";
import { RegisterForm } from "../components/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Créez votre accès en 30 secondes, puis configurez votre organisation."
    >
      <RegisterForm />
    </AuthShell>
  );
}
