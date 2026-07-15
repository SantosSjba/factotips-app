-- CreateTable
CREATE TABLE "digemid_cache" (
    "id" TEXT NOT NULL,
    "cache_key" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "total" INTEGER,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digemid_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "digemid_cache_cache_key_key" ON "digemid_cache"("cache_key");

-- CreateIndex
CREATE INDEX "digemid_cache_expires_at_idx" ON "digemid_cache"("expires_at");

-- CreateIndex
CREATE INDEX "digemid_cache_endpoint_fetched_at_idx" ON "digemid_cache"("endpoint", "fetched_at");
