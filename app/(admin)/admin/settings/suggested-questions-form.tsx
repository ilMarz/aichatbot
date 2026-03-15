"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/toast";
import {
  updateSuggestedQuestionsAction,
  type SuggestedQuestionsState,
} from "../../actions";

interface SuggestedQuestionsFormProps {
  initialQuestions: string[];
}

export function SuggestedQuestionsForm({
  initialQuestions,
}: SuggestedQuestionsFormProps) {
  const [state, formAction, isPending] = useActionState<
    SuggestedQuestionsState,
    FormData
  >(updateSuggestedQuestionsAction, { status: "idle" });

  useEffect(() => {
    if (state.status === "success") {
      toast({ type: "success", description: state.message ?? "Salvato!" });
    } else if (state.status === "error") {
      toast({ type: "error", description: state.message ?? "Errore." });
    }
  }, [state.status, state.message]);

  const defaults = [
    initialQuestions[0] ?? "",
    initialQuestions[1] ?? "",
    initialQuestions[2] ?? "",
    initialQuestions[3] ?? "",
  ];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {(["q1", "q2", "q3", "q4"] as const).map((name, i) => (
          <div key={name} className="flex flex-col gap-1.5">
            <Label htmlFor={name} className="text-sm font-medium">
              Domanda {i + 1}
            </Label>
            <Input
              id={name}
              name={name}
              defaultValue={defaults[i]}
              placeholder={`Es. Come posso aiutarti oggi?`}
              className="text-sm"
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground">
          Queste domande appaiono come suggerimenti nella schermata iniziale
          della chat.
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvataggio..." : "Salva domande"}
        </Button>
      </div>
    </form>
  );
}
