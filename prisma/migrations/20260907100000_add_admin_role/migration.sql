-- AlterTable
ALTER TABLE "admins" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'admin';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "admins_role_idx" ON "admins"("role");
