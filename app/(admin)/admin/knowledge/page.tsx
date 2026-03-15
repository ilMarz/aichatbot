import { Suspense } from "react";
import { getAllKnowledgeDocuments } from "@/lib/db/queries";
import { KnowledgeForm } from "./knowledge-form";
import { DocumentList } from "./document-list";

async function DocumentListContent() {
  const documents = await getAllKnowledgeDocuments();
  return <DocumentList documents={documents} />;
}

export default function KnowledgePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Carica testi, trascrizioni o qualsiasi contenuto che il bot userà come
          riferimento per rispondere nello stile configurato.
        </p>
      </div>

      {/* Upload form */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold">Aggiungi documento</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Il testo verrà suddiviso in chunk e indicizzato semanticamente. Puoi
          caricare testi di canzoni, interviste, biografie o qualsiasi altro
          materiale.
        </p>
        <KnowledgeForm />
      </div>

      {/* Document list */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">Documenti caricati</h2>
        <Suspense
          fallback={
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          }
        >
          <DocumentListContent />
        </Suspense>
      </div>
    </div>
  );
}
