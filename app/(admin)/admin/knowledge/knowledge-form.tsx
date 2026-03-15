"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  uploadKnowledgeDocumentAction,
  type KnowledgeUploadState,
} from "../../actions";

type Mode = "paste" | "file";

const initialState: KnowledgeUploadState = { status: "idle" };

export function KnowledgeForm() {
  const [mode, setMode] = useState<Mode>("paste");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(
    uploadKnowledgeDocumentAction,
    initialState
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setContent((ev.target?.result as string) ?? "");
    };
    reader.readAsText(file, "utf-8");
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Hidden content field populated from textarea or file reader */}
      <input type="hidden" name="content" value={content} />

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="kn-title">Titolo</Label>
        <Input
          id="kn-title"
          name="title"
          placeholder="Es. Testi album 2023, Intervista Rolling Stone..."
          required
        />
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "paste"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Incolla testo
        </button>
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "file"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Carica file (.txt / .md)
        </button>
      </div>

      {/* Content input */}
      {mode === "paste" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kn-text">Testo</Label>
          <Textarea
            id="kn-text"
            rows={10}
            placeholder="Incolla qui il testo del documento..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required={mode === "paste"}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="kn-file">File</Label>
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {fileName ? (
              <span className="font-medium text-foreground">{fileName}</span>
            ) : (
              <span>Clicca per selezionare un file .txt o .md</span>
            )}
            <input
              ref={fileInputRef}
              id="kn-file"
              type="file"
              accept=".txt,.md"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {content && (
            <p className="text-xs text-muted-foreground">
              {content.length.toLocaleString()} caratteri caricati
            </p>
          )}
        </div>
      )}

      {/* Feedback */}
      {state.status === "success" && (
        <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending || !content.trim()}
        className="self-start"
      >
        {isPending ? "Caricamento in corso..." : "Carica documento"}
      </Button>
    </form>
  );
}
