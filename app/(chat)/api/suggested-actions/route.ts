import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db/queries";

const DEFAULT_SUGGESTIONS = [
  "Come posso aiutarti oggi?",
  "Hai domande su qualcosa di specifico?",
  "Vuoi che ti spieghi qualcosa?",
  "Come posso semplificarti la giornata?",
];

export async function GET() {
  try {
    const raw = await getSetting("suggested_questions");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return NextResponse.json({ suggestions: parsed });
      }
    }
  } catch {
    // fall through to default
  }
  return NextResponse.json({ suggestions: DEFAULT_SUGGESTIONS });
}
