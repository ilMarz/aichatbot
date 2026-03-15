"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  createUserWithRole,
  getAllUsers,
  updateUserRole,
  upsertSetting,
} from "@/lib/db/queries";
import { generateSuggestedQuestions } from "@/lib/ai/generate-suggestions";
import type { UserRole } from "@/lib/db/schema";

// ─── Guard ────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

export type SystemPromptState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function updateSystemPromptAction(
  _state: SystemPromptState,
  formData: FormData
): Promise<SystemPromptState> {
  try {
    await requireAdmin();
    const prompt = formData.get("prompt");
    const parsed = z.string().min(1).safeParse(prompt);
    if (!parsed.success) {
      return { status: "error", message: "Il prompt non può essere vuoto." };
    }
    await upsertSetting("system_prompt", parsed.data);

    // Auto-generate suggested questions based on the new prompt
    const questions = await generateSuggestedQuestions(parsed.data);
    await upsertSetting("suggested_questions", JSON.stringify(questions));

    revalidatePath("/admin/settings");
    return { status: "success", message: "Prompt aggiornato con successo." };
  } catch (err: any) {
    return {
      status: "error",
      message: err?.message ?? "Errore durante il salvataggio.",
    };
  }
}

// ─── Create User ──────────────────────────────────────────────────────────────

export type CreateUserState = {
  status: "idle" | "success" | "error" | "user_exists";
  message?: string;
};

const createUserSchema = z.object({
  email: z.string().email("Email non valida."),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri."),
  role: z.enum(["user", "admin"]),
});

export async function createUserAction(
  _state: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  try {
    await requireAdmin();

    const parsed = createUserSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    });

    if (!parsed.success) {
      return {
        status: "error",
        message: parsed.error.errors[0]?.message ?? "Dati non validi.",
      };
    }

    const { email, password, role } = parsed.data;

    // Check if user already exists
    const { getUser } = await import("@/lib/db/queries");
    const existing = await getUser(email);
    if (existing.length > 0) {
      return { status: "user_exists", message: "L'utente esiste già." };
    }

    await createUserWithRole(email, password, role as UserRole);
    revalidatePath("/admin/users");
    return {
      status: "success",
      message: `Utente "${email}" creato con ruolo "${role}".`,
    };
  } catch (err: any) {
    return {
      status: "error",
      message: err?.message ?? "Errore durante la creazione dell'utente.",
    };
  }
}

// ─── Update User Role ─────────────────────────────────────────────────────────

export type UpdateRoleState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function updateUserRoleAction(
  _state: UpdateRoleState,
  formData: FormData
): Promise<UpdateRoleState> {
  try {
    const session = await requireAdmin();

    const userId = z.string().uuid().parse(formData.get("userId"));
    const role = z.enum(["user", "admin"]).parse(formData.get("role"));

    // Prevent self-demotion
    if (userId === session.user.id && role !== "admin") {
      return {
        status: "error",
        message: "Non puoi rimuovere il tuo stesso ruolo admin.",
      };
    }

    await updateUserRole(userId, role as UserRole);
    revalidatePath("/admin/users");
    return { status: "success", message: "Ruolo aggiornato." };
  } catch (err: any) {
    return {
      status: "error",
      message: err?.message ?? "Errore durante l'aggiornamento del ruolo.",
    };
  }
}
