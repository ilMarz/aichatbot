"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteKnowledgeDocumentAction } from "../../actions";

type DocItem = {
  id: string;
  title: string;
  createdAt: Date;
  preview: string;
};

export function DocumentList({ documents }: { documents: DocItem[] }) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="opacity-40"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <p className="text-sm">Nessun documento caricato.</p>
        <p className="text-xs">Usa il form sopra per aggiungere testi alla knowledge base.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {documents.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} />
      ))}
    </ul>
  );
}

function DocumentRow({ doc }: { doc: DocItem }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteKnowledgeDocumentAction(doc.id);
    });
  }

  return (
    <li className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">{doc.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {doc.preview}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(doc.createdAt).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={isPending}
        onClick={handleDelete}
      >
        {isPending ? "..." : "Elimina"}
      </Button>
    </li>
  );
}
