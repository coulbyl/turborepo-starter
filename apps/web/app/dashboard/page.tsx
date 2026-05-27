import Link from "next/link";
import {
  FolderOpen,
  Clock,
  CheckCircle2,
  Wallet,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@identis/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@identis/ui/card";
import { Badge } from "@identis/ui/badge";
import { Button } from "@identis/ui/button";
import { getCurrentSession } from "@/domains/auth/use-cases/get-current-session";
import { getWorkspaces } from "@/domains/workspace/use-cases/get-workspaces";
import { getWorkspaceStats } from "@/domains/workspace/use-cases/get-workspace-stats";
import { STATUS_LABEL, STATUS_COLOR } from "@/domains/case/types/case";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const [session, workspaces] = await Promise.all([
    getCurrentSession(),
    getWorkspaces(),
  ]);

  if (!session) redirect("/auth/login");
  if (workspaces.length === 0) redirect("/dashboard/workspace/new");

  const workspace = workspaces[0]!;
  const stats = await getWorkspaceStats(workspace.id);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {session.user.fullName.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {workspace.name} · Vue d&apos;ensemble
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cases/new">Nouveau dossier</Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Solde wallet"
          value={`${stats.walletBalance.toLocaleString("fr-FR")} FCFA`}
          icon={<Wallet className="h-3 w-3" />}
          tone={stats.walletBalance < 2000 ? "warning" : "accent"}
          delta={
            stats.walletBalance < 2000 ? (
              <span className="text-xs text-amber-600">
                Solde bas — rechargez
              </span>
            ) : undefined
          }
        />
        <StatCard
          label="Dossiers ce mois"
          value={String(stats.casesThisMonth)}
          icon={<TrendingUp className="h-3 w-3" />}
          tone="accent"
          delta={
            <span className="text-xs text-muted-foreground">
              {stats.totalCases} au total
            </span>
          }
        />
        <StatCard
          label="En attente"
          value={String(stats.pendingCases)}
          icon={<Clock className="h-3 w-3" />}
          tone={stats.pendingCases > 0 ? "warning" : "neutral"}
          delta={
            <span className="text-xs text-muted-foreground">
              PENDING + EN RÉVISION
            </span>
          }
        />
        <StatCard
          label="Taux d'approbation"
          value={stats.approvalRate !== null ? `${stats.approvalRate}%` : "—"}
          icon={<CheckCircle2 className="h-3 w-3" />}
          tone={
            stats.approvalRate === null
              ? "neutral"
              : stats.approvalRate >= 70
                ? "success"
                : "warning"
          }
          delta={
            <span className="text-xs text-muted-foreground">
              {stats.approvalRate === null
                ? "Aucun dossier traité"
                : stats.approvalRate >= 70
                  ? "Bon taux"
                  : "À surveiller"}
            </span>
          }
        />
      </div>

      {/* Recent cases */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            Derniers dossiers
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/cases" className="flex items-center gap-1">
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {stats.recentCases.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground text-sm">
                Aucun dossier pour l&apos;instant
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/cases/new">
                  Créer le premier dossier
                </Link>
              </Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="px-6 py-3 text-left font-medium">Référence</th>
                  <th className="px-6 py-3 text-left font-medium">Sujet</th>
                  <th className="px-6 py-3 text-left font-medium">Statut</th>
                  <th className="px-6 py-3 text-left font-medium">Date</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {stats.recentCases.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                      {c.reference}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {c.formData
                        ? `${c.formData.firstName} ${c.formData.lastName}`
                        : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${STATUS_COLOR[c.status]}`}
                      >
                        {STATUS_LABEL[c.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/cases/${c.id}`}>Voir</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
