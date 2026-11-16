-- Live chat: conversations and messages.
-- Run ONCE against production BEFORE deploying the new build:
--
--   DBURL=$(grep -h '^DATABASE_URL' .env | cut -d= -f2- | tr -d '"' | sed 's/?.*//')
--   psql "$DBURL" -v ON_ERROR_STOP=1 -f scripts/migrations/2026-11-13-live-chat.sql
--
-- Safe to re-run: types, enum values, tables, indexes and constraints are created only if missing.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ChatStatus') THEN
    CREATE TYPE "ChatStatus" AS ENUM ('OPEN', 'CLOSED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ChatSender') THEN
    CREATE TYPE "ChatSender" AS ENUM ('VISITOR', 'AGENT', 'BOT', 'SYSTEM');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "chat_conversations" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "visitorPhone" TEXT NOT NULL,
    "visitorEmail" TEXT,
    "trackingNumber" TEXT,
    "customerId" TEXT,
    "assignedToId" TEXT,
    "status" "ChatStatus" NOT NULL DEFAULT 'OPEN',
    "unreadForAgent" INTEGER NOT NULL DEFAULT 0,
    "unreadForVisitor" INTEGER NOT NULL DEFAULT 0,
    "awaitingTracking" BOOLEAN NOT NULL DEFAULT false,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" TEXT NOT NULL,
    "seq" SERIAL NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" "ChatSender" NOT NULL,
    "userId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_conversations_tokenHash_key"
  ON "chat_conversations"("tokenHash");
CREATE INDEX IF NOT EXISTS "chat_conversations_status_lastMessageAt_idx"
  ON "chat_conversations"("status", "lastMessageAt");
CREATE INDEX IF NOT EXISTS "chat_conversations_visitorPhone_idx"
  ON "chat_conversations"("visitorPhone");
CREATE INDEX IF NOT EXISTS "chat_messages_conversationId_seq_idx"
  ON "chat_messages"("conversationId", "seq");
CREATE UNIQUE INDEX IF NOT EXISTS "chat_messages_seq_key"
  ON "chat_messages"("seq");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_conversations_customerId_fkey') THEN
    ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_conversations_assignedToId_fkey') THEN
    ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_assignedToId_fkey"
      FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_conversationId_fkey') THEN
    ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversationId_fkey"
      FOREIGN KEY ("conversationId") REFERENCES "chat_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_userId_fkey') THEN
    ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;

-- Activity log entries for chat close/reopen, assign and customer links.
-- Kept outside the transaction above; IF NOT EXISTS makes it safe to re-run.
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'CHAT_UPDATED';
