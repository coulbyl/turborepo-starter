import { getMembers } from "@/domains/workspace/use-cases/get-members";
import { getWorkspaces } from "@/domains/workspace/use-cases/get-workspaces";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { MembersClient } from "./components/members-client";

export default async function MembersPage() {
  const workspaces = await getWorkspaces();
  if (workspaces.length === 0) redirect("/dashboard/workspace/new");

  const workspace = workspaces[0]!;
  const members = await getMembers(workspace.id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Membres"
        description={`Gérez les accès à ${workspace.name}`}
      />
      <MembersClient
        workspaceId={workspace.id}
        initialMembers={members}
        currentUserRole={workspace.memberRole ?? "AGENT"}
      />
    </div>
  );
}
