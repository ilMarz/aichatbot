"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  createKnowledgeDocument,
  createUserWithRole,
  deleteKnowledgeDocument,
  getAllUsers,
  updateUserRole,
  upsertSetting,
} from "@/lib/db/queries";
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
    revalidatePath("/admin/settings");
    return { status: "success", message: "Prompt aggiornato con successo." };
  } catch (err: any) {
    return {
      status: "error",
      message: err?.message ?? "Errore durante il salvataggio.",
    };
  }
}

// ─── Suggested Questions Toggle ───────────────────────────────────────────────

export async function toggleSuggestedQuestionsAction(
  enabled: boolean
): Promise<void> {
  await requireAdmin();
  await upsertSetting("suggested_questions_enabled", enabled ? "true" : "false");
  revalidatePath("/admin/settings");
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

// ─── Knowledge Base ────────────────────────────────────────────────────────────

export type KnowledgeUploadState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function uploadKnowledgeDocumentAction(
  _state: KnowledgeUploadState,
  formData: FormData
): Promise<KnowledgeUploadState> {
  try {
    const session = await requireAdmin();

    const title = z.string().min(1, "Il titolo è obbligatorio.").parse(formData.get("title"));
    const content = z
      .string()
      .min(10, "Il testo deve avere almeno 10 caratteri.")
      .parse(formData.get("content"));

    // Lazy import to avoid loading embedding code on every server action
    const { chunkText } = await import("@/lib/knowledge/chunker");
    const { generateEmbeddings } = await import("@/lib/knowledge/embeddings");

    const textChunks = chunkText(content);
    const embeddings = await generateEmbeddings(textChunks);

    const chunks = textChunks.map((text, i) => ({
      content: text,
      embedding: embeddings[i],
    }));

    await createKnowledgeDocument({
      title,
      content,
      uploadedBy: session.user.id,
      chunks,
    });

    revalidatePath("/admin/knowledge");
    return {
      status: "success",
      message: `Documento "${title}" caricato con ${chunks.length} chunk.`,
    };
  } catch (err: any) {
    return {
      status: "error",
      message: err?.message ?? "Errore durante il caricamento del documento.",
    };
  }
}

export type KnowledgeDeleteState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function deleteKnowledgeDocumentAction(
  id: string
): Promise<KnowledgeDeleteState> {
  try {
    await requireAdmin();
    await deleteKnowledgeDocument(id);
    revalidatePath("/admin/knowledge");
    return { status: "success", message: "Documento eliminato." };
  } catch (err: any) {
    return {
      status: "error",
      message: err?.message ?? "Errore durante l'eliminazione.",
    };
  }
}
