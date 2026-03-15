import { generateText } from "ai";
import { getTitleModel } from "./providers";

/**
 * Uses AI to generate 4 suggested questions coherent with the given system prompt.
 * Returns an array of strings, falling back to generic questions on error.
 */
export async function generateSuggestedQuestions(
  systemPrompt: string
): Promise<string[]> {
  const fallback = [
    "Come posso aiutarti oggi?",
    "Hai domande su qualcosa di specifico?",
    "Vuoi che ti spieghi qualcosa?",
    "Come posso semplificarti la giornata?",
  ];

  try {
    const { text } = await generateText({
      model: getTitleModel(),
      prompt: `Dato questo system prompt per un assistente AI:

"${systemPrompt}"

Genera esattamente 4 domande brevi (max 8 parole ciascuna) che un utente potrebbe fare a questo assistente. Le domande devono essere coerenti con le capacità descritte nel prompt.
Rispondi SOLO con le 4 domande, una per riga, senza numerazione, senza prefissi, senza spiegazioni.`,
      maxTokens: 150,
    });

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && l.length < 80)
      .slice(0, 4);

    return lines.length === 4 ? lines : fallback;
  } catch {
    return fallback;
  }
}
