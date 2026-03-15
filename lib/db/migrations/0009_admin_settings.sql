-- Add role column to User table (existing users default to 'user')
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" varchar(20) NOT NULL DEFAULT 'user';

-- Create Settings table for app-wide configuration
CREATE TABLE IF NOT EXISTS "Settings" (
  "key" varchar(64) PRIMARY KEY NOT NULL,
  "value" text NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Seed default system prompt
INSERT INTO "Settings" ("key", "value")
VALUES ('system_prompt', 'You are a friendly assistant! Keep your responses concise and helpful.')
ON CONFLICT ("key") DO NOTHING;
