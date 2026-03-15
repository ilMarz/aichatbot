import { Suspense } from "react";
import { getSetting } from "@/lib/db/queries";
import { SettingsForm } from "./settings-form";
import { SuggestedQuestionsForm } from "./suggested-questions-form";

async function SettingsContent() {
  const currentPrompt =
    (await getSetting("system_prompt")) ??
    "You are a friendly assistant! Keep your responses concise and helpful.";

  return <SettingsForm initialPrompt={currentPrompt} />;
}

async function SuggestedQuestionsContent() {
  const raw = await getSetting("suggested_questions");
  let questions: string[] = [
    "Come posso aiutarti oggi?",
    "Hai domande su qualcosa di specifico?",
    "Vuoi che ti spieghi qualcosa?",
    "Come posso semplificarti la giornata?",
  ];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) questions = parsed;
    } catch {}
  }
  return <SuggestedQuestionsForm initialQuestions={questions} />;
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
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded-md bg-muted" />
          }
        >
          <SettingsContent />
        </Suspense>
      </div>

      {/* Suggested Questions */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold">Domande suggerite</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Le domande mostrate come suggerimenti nella schermata iniziale della
          chat.
        </p>
        <Suspense
          fallback={
            <div className="h-32 animate-pulse rounded-md bg-muted" />
          }
        >
          <SuggestedQuestionsContent />
        </Suspense>
      </div>
    </div>
  );
}
