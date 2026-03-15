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
        <h1 className="text-2xl font-bold tracking-tight">System Prompt</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configura il comportamento dell'assistente AI per tutte le
          conversazioni.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
