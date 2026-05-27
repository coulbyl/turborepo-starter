"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientApiRequest } from "@/lib/api/client-api";
import { UserPlus, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@identis/ui/card";
import { Button } from "@identis/ui/button";
import { Badge } from "@identis/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@identis/ui";
import {
  useInviteMember,
  useRemoveMember,
  useUpdateMemberRole,
} from "@/domains/workspace/use-cases/members";
import type { Member, MemberRole } from "@/domains/workspace/types/workspace";
import { MEMBER_ROLE_LABEL } from "@/domains/workspace/types/workspace";

const ROLE_COLOR: Record<MemberRole, string> = {
  ADMIN: "text-purple-600 bg-purple-50 border-purple-200",
  AGENT: "text-blue-600 bg-blue-50 border-blue-200",
  REVIEWER: "text-amber-600 bg-amber-50 border-amber-200",
  COMPLIANCE: "text-emerald-600 bg-emerald-50 border-emerald-200",
  DEVELOPER: "text-slate-600 bg-slate-50 border-slate-200",
};

const ALL_ROLES: MemberRole[] = [
  "ADMIN",
  "AGENT",
  "REVIEWER",
  "COMPLIANCE",
  "DEVELOPER",
];

const inviteSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  role: z.enum(["ADMIN", "AGENT", "REVIEWER", "COMPLIANCE", "DEVELOPER"]),
});

type InviteValues = z.infer<typeof inviteSchema>;

export function MembersClient({
  workspaceId,
  initialMembers,
  currentUserRole,
}: {
  workspaceId: string;
  initialMembers: Member[];
  currentUserRole: MemberRole;
}) {
  const isAdmin = currentUserRole === "ADMIN";
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const { data: members = initialMembers } = useQuery<Member[]>({
    queryKey: ["members", workspaceId],
    queryFn: () =>
      clientApiRequest<Member[]>(`/workspaces/${workspaceId}/members`),
    initialData: initialMembers,
  });

  const invite = useInviteMember(workspaceId);
  const updateRole = useUpdateMemberRole(workspaceId);
  const remove = useRemoveMember(workspaceId);

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "AGENT" },
    mode: "onTouched",
  });

  async function onInvite(values: InviteValues) {
    setInviteError(null);
    try {
      await invite.mutateAsync(values);
      form.reset();
      setInviteOpen(false);
    } catch (e) {
      setInviteError(
        e instanceof Error ? e.message : "Erreur lors de l'invitation",
      );
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            {members.length} membre{members.length > 1 ? "s" : ""}
          </CardTitle>
          {isAdmin && (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4 mr-1.5" />
              Inviter
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                <th className="px-6 py-3 text-left font-medium">Membre</th>
                <th className="px-6 py-3 text-left font-medium">Email</th>
                <th className="px-6 py-3 text-left font-medium">Rôle</th>
                <th className="px-6 py-3 text-left font-medium">Depuis</th>
                {isAdmin && <th className="px-6 py-3 w-12" />}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-3 font-medium">{m.user.fullName}</td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {m.user.email}
                  </td>
                  <td className="px-6 py-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${ROLE_COLOR[m.role]}`}
                    >
                      {MEMBER_ROLE_LABEL[m.role]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {ALL_ROLES.filter((r) => r !== m.role).map((r) => (
                            <DropdownMenuItem
                              key={r}
                              onClick={() =>
                                updateRole.mutate({ memberId: m.id, role: r })
                              }
                            >
                              Passer en {MEMBER_ROLE_LABEL[r]}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => remove.mutate(m.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Retirer du workspace
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog
        open={inviteOpen}
        onOpenChange={(open) => {
          setInviteOpen(open);
          if (!open) {
            form.reset();
            setInviteError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un membre</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              className="flex flex-col gap-4 py-2"
              onSubmit={form.handleSubmit(onInvite)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="prenom@societe.ci"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ALL_ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {MEMBER_ROLE_LABEL[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {inviteError && (
                <p className="text-sm text-destructive">{inviteError}</p>
              )}
              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={invite.isPending}>
                  {invite.isPending ? "Invitation…" : "Inviter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
