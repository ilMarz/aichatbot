import { generateText } from "ai";
import { getTitleModel } from "./providers";

/**
 * Uses AI to generate 4 suggested questions coherent with the system prompt.
 * If conversationContext is provided, questions are tailored to the conversation.
 */
export async function generateSuggestedQuestions(
  systemPrompt: string,
  conversationContext?: string
): Promise<string[]> {
  const fallback = [
    "Come posso aiutarti oggi?",
    "Hai domande su qualcosa di specifico?",
    "Vuoi che ti spieghi qualcosa?",
    "Come posso semplificarti la giornata?",
  ];

  try {
    const contextSection = conversationContext
      ? `\nConversazione recente:\n${conversationContext}\n\nGenera 4 domande di follow-up che l'utente potrebbe fare continuando questa conversazione.`
      : "Genera 4 domande che un utente potrebbe fare a questo assistente per iniziare una conversazione.";

    const { text } = await generateText({
      model: getTitleModel(),
      prompt: `Dato questo system prompt per un assistente AI:

"${systemPrompt}"

${contextSection}

Le domande devono essere brevi (max 8 parole), in italiano, coerenti con le capacità dell'assistente.
Rispondi SOLO con le 4 domande, una per riga, senza numerazione, senza prefissi, senza spiegazioni.`,
      maxTokens: 150,
    });

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && l.length < 80)
      .slice(0, 4);

    return lines.length >= 2 ? lines : fallback;
  } catch {
    return fallback;
  }
}
