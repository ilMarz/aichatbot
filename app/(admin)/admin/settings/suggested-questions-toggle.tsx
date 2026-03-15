"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/toast";
import { toggleSuggestedQuestionsAction } from "../../actions";

export function SuggestedQuestionsToggle({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      try {
        await toggleSuggestedQuestionsAction(checked);
        toast({
          type: "success",
          description: checked
            ? "Domande suggerite abilitate."
            : "Domande suggerite disabilitate.",
        });
      } catch {
        toast({ type: "error", description: "Errore durante il salvataggio." });
      }
    });
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <Label htmlFor="suggestions-toggle" className="text-sm font-medium">
          Domande suggerite
        </Label>
        <p className="text-xs text-muted-foreground">
          Mostra domande generate dall&apos;AI nella schermata iniziale della
          chat. Disabilitando si risparmiano token.
        </p>
      </div>
      <Switch
        id="suggestions-toggle"
        defaultChecked={initialEnabled}
        onCheckedChange={handleChange}
        disabled={isPending}
      />
    </div>
  );
}
