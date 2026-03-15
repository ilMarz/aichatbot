import { Suspense } from "react";
import { getSetting } from "@/lib/db/queries";
import { SettingsForm } from "./settings-form";

async function SettingsContent() {
  const currentPrompt =
    (await getSetting("system_prompt")) ??
    "You are a friendly assistant! Keep your responses concise and helpful.";

  return <SettingsForm initialPrompt={currentPrompt} />;
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Impostazioni</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configura il comportamento dell&apos;assistente AI. Le domande
          suggerite nella chat vengono generate automaticamente dal prompt.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold">System Prompt</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Il prompt inviato all&apos;IA all&apos;inizio di ogni conversazione.
          Salvando, le domande suggerite vengono rigenerate automaticamente.
        </p>
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded-md bg-muted" />
          }
        >
          <SettingsContent />
        </Suspense>
      </div>
    </div>
  );
}
