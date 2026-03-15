"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/toast";
import {
  updateSystemPromptAction,
  type SystemPromptState,
} from "../../actions";

interface SettingsFormProps {
  initialPrompt: string;
}

export function SettingsForm({ initialPrompt }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState<
    SystemPromptState,
    FormData
  >(updateSystemPromptAction, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      toast({ type: "success", description: state.message ?? "Salvato!" });
    } else if (state.status === "error") {
      toast({ type: "error", description: state.message ?? "Errore." });
    }
  }, [state.status, state.message]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          System Prompt
        </Label>
        <Textarea
          id="prompt"
          name="prompt"
          rows={12}
          defaultValue={initialPrompt}
          placeholder="Es. Sei un assistente virtuale che risponde in maniera formale. Il tuo compito è..."
          className="resize-y font-mono text-sm"
          required
        />
        <p className="text-xs text-muted-foreground">
          Questo prompt viene inviato all'IA all'inizio di ogni conversazione
          per personalizzarne il comportamento.
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvataggio..." : "Salva prompt"}
        </Button>
      </div>
    </form>
  );
}
