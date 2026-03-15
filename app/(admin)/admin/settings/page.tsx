import { Suspense } from "react";
import { getAllKnowledgeDocuments, getSetting } from "@/lib/db/queries";
import { DocumentList } from "../knowledge/document-list";
import { KnowledgeForm } from "../knowledge/knowledge-form";
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

async function DocumentListContent() {
  const documents = await getAllKnowledgeDocuments();
  return <DocumentList documents={documents} />;
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

      {/* Knowledge Base */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold">Knowledge Base</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Carica testi, trascrizioni o qualsiasi contenuto che il bot userà come
          riferimento per rispondere nello stile configurato.
        </p>

        <KnowledgeForm />

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-medium">Documenti caricati</h3>
          <Suspense
            fallback={
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            }
          >
            <DocumentListContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
