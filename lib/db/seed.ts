/**
 * Seed script: creates the built-in admin account if it doesn't exist.
 *
 * Usage: pnpm db:seed
 *
 * Admin credentials:
 *   email:    admin@tp-ai.com
 *   password: admintp2026
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { generateHashedPassword } from "./utils";
import { user } from "./schema";

const ADMIN_EMAIL = "admin@tp-ai.com";
const ADMIN_PASSWORD = "admintp2026";

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

async function seed() {
  console.log("🌱 Running seed...");

  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL));

  if (existing.length > 0) {
    console.log(`✅ Admin user already exists (${ADMIN_EMAIL}), skipping.`);
  } else {
    const hashedPassword = generateHashedPassword(ADMIN_PASSWORD);
    await db.insert(user).values({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
  }

  await client.end();
  console.log("🌱 Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
