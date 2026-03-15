import { Suspense } from "react";
import { getSetting } from "@/lib/db/queries";
import { SettingsForm } from "./settings-form";
import { SuggestedQuestionsToggle } from "./suggested-questions-toggle";

async function SettingsContent() {
  const currentPrompt =
    (await getSetting("system_prompt")) ??
    "You are a friendly assistant! Keep your responses concise and helpful.";
  return <SettingsForm initialPrompt={currentPrompt} />;
}

async function ToggleContent() {
  const raw = await getSetting("suggested_questions_enabled");
  const enabled = raw !== "false"; // default true
  return <SuggestedQuestionsToggle initialEnabled={enabled} />;
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Impostazioni</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configura il comportamento dell&apos;assistente AI.
        </p>
      </div>

      {/* System Prompt */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold">System Prompt</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Il prompt inviato all&apos;IA all&apos;inizio di ogni conversazione.
        </p>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-muted" />}>
          <SettingsContent />
        </Suspense>
      </div>

      {/* Suggested Questions Toggle */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
          <ToggleContent />
        </Suspense>
      </div>
    </div>
  );
}
