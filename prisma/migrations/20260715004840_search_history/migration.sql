-- CreateTable
CREATE TABLE "search_history" (
    "id" TEXT NOT NULL,
    "anonymous_id" TEXT NOT NULL,
    "user_id" TEXT,
    "codigo_producto" TEXT NOT NULL,
    "nombre_producto" TEXT NOT NULL,
    "concent" TEXT,
    "nombre_forma_farmaceutica" TEXT,
    "cod_grupo_ff" TEXT,
    "codigo_departamento" TEXT NOT NULL,
    "codigo_provincia" TEXT,
    "codigo_ubigeo" TEXT,
    "ubicacion_label" TEXT,
    "cod_tipo_establecimiento" TEXT,
    "nombre_establecimiento" TEXT,
    "nombre_laboratorio" TEXT,
    "result_count" INTEGER NOT NULL DEFAULT 0,
    "from_cache" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_history_anonymous_id_created_at_idx" ON "search_history"("anonymous_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "search_history_user_id_created_at_idx" ON "search_history"("user_id", "created_at" DESC);
