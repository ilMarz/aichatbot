"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/toast";
import {
  createUserAction,
  updateUserRoleAction,
  type CreateUserState,
  type UpdateRoleState,
} from "../../actions";
import type { User } from "@/lib/db/schema";

// ─── Role toggle button ───────────────────────────────────────────────────────

function RoleToggle({ user, currentUserId }: { user: User; currentUserId: string }) {
  const [state, formAction, isPending] = useActionState<UpdateRoleState, FormData>(
    updateUserRoleAction,
    { status: "idle" }
  );

  useEffect(() => {
    if (state.status === "success") {
      toast({ type: "success", description: state.message ?? "Ruolo aggiornato." });
    } else if (state.status === "error") {
      toast({ type: "error", description: state.message ?? "Errore." });
    }
  }, [state.status, state.message]);

  const newRole = user.role === "admin" ? "user" : "admin";
  const isSelf = user.id === currentUserId;

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={user.id} />
      <input type="hidden" name="role" value={newRole} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={isPending || isSelf}
        title={isSelf ? "Non puoi modificare il tuo stesso ruolo" : undefined}
      >
        {isPending
          ? "..."
          : user.role === "admin"
            ? "Declassa a user"
            : "Promuovi ad admin"}
      </Button>
    </form>
  );
}

// ─── Users table ──────────────────────────────────────────────────────────────

export function UsersTable({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Email
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Ruolo
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Azioni
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr key={u.id} className="bg-card hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
              <td className="px-4 py-3">
                <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                  {u.role}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <RoleToggle user={u} currentUserId={currentUserId} />
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                Nessun utente trovato.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Create user form ─────────────────────────────────────────────────────────

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState<CreateUserState, FormData>(
    createUserAction,
    { status: "idle" }
  );

  useEffect(() => {
    if (state.status === "success") {
      toast({ type: "success", description: state.message ?? "Utente creato!" });
    } else if (state.status === "error" || state.status === "user_exists") {
      toast({ type: "error", description: state.message ?? "Errore." });
    }
  }, [state.status, state.message]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="utente@esempio.com"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Min. 6 caratteri"
            minLength={6}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="role" className="text-sm font-medium">
            Ruolo
          </Label>
          <select
            id="role"
            name="role"
            defaultValue="user"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creazione..." : "Crea utente"}
        </Button>
      </div>
    </form>
  );
}
