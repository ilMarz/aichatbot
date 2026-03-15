import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { getAllUsers } from "@/lib/db/queries";
import { UsersTable, CreateUserForm } from "./users-client";

async function UsersContent() {
  const [users, session] = await Promise.all([getAllUsers(), auth()]);

  return (
    <UsersTable users={users} currentUserId={session?.user?.id ?? ""} />
  );
}

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Utenti</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestisci gli utenti registrati e i loro ruoli.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold">Utenti registrati</h2>
        <Suspense
          fallback={
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
          }
        >
          <UsersContent />
        </Suspense>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Crea nuovo utente</h2>
          <p className="text-sm text-muted-foreground">
            Aggiungi un nuovo account con ruolo user o admin.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <CreateUserForm />
        </div>
      </section>
    </div>
  );
}
