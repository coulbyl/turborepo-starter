import { getCurrentSession } from "@/domains/auth/use-cases/get-current-session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {session.user.fullName}
        </p>
      </div>
    </div>
  );
}
