import { NextResponse } from "next/server";
import { getSetting, upsertSetting } from "@/lib/db/queries";
import { generateSuggestedQuestions } from "@/lib/ai/generate-suggestions";

export async function GET() {
  try {
    const raw = await getSetting("suggested_questions");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return NextResponse.json({ suggestions: parsed });
      }
    }

    // No questions stored yet - generate from system prompt and cache
    const systemPrompt = await getSetting("system_prompt");
    const questions = await generateSuggestedQuestions(
      systemPrompt ?? "You are a friendly assistant."
    );
    await upsertSetting("suggested_questions", JSON.stringify(questions));
    return NextResponse.json({ suggestions: questions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
