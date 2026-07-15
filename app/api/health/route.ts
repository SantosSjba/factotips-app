import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  let database: "ok" | "skip" | "error" = "skip";

  const prisma = getPrisma();
  if (prisma) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "ok";
    } catch {
      database = "error";
    }
  }

  return NextResponse.json({
    ok: true,
    service: "factotips",
    database,
  });
}
