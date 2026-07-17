-- CreateTable
CREATE TABLE "tool_visit" (
    "id" TEXT NOT NULL,
    "anonymous_id" TEXT NOT NULL,
    "user_id" TEXT,
    "tool_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_visit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tool_visit_tool_id_created_at_idx" ON "tool_visit"("tool_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "tool_visit_anonymous_id_tool_id_created_at_idx" ON "tool_visit"("anonymous_id", "tool_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "tool_visit_created_at_idx" ON "tool_visit"("created_at" DESC);
