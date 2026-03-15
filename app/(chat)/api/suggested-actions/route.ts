import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db/queries";
import { generateSuggestedQuestions } from "@/lib/ai/generate-suggestions";

export async function GET(request: Request) {
  try {
    // Check if feature is enabled (default: true)
    const enabledRaw = await getSetting("suggested_questions_enabled");
    if (enabledRaw === "false") {
      return NextResponse.json({ suggestions: [], enabled: false });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    const systemPrompt =
      (await getSetting("system_prompt")) ?? "You are a friendly assistant.";

    // If a chatId is provided, fetch recent messages for context
    let conversationContext = "";
    if (chatId) {
      const { getMessagesByChatId } = await import("@/lib/db/queries");
      const messages = await getMessagesByChatId({ id: chatId });
      const recent = messages.slice(-6);
      if (recent.length > 0) {
        conversationContext = recent
          .map((m) => {
            const parts = m.parts as any[];
            const text = parts
              ?.filter((p) => p.type === "text")
              .map((p) => p.text)
              .join(" ");
            return `${m.role}: ${text}`;
          })
          .join("\n");
      }
    }

    const questions = await generateSuggestedQuestions(
      systemPrompt,
      conversationContext
    );
    return NextResponse.json({ suggestions: questions, enabled: true });
  } catch {
    return NextResponse.json({ suggestions: [], enabled: true });
  }
}
