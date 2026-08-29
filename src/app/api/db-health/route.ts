import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");

  try {
    const start = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    const elapsed = Date.now() - start;

    return NextResponse.json({
      status: "OK",
      database: "CONNECTED",
      elapsedMs: elapsed,
      datasource: maskedUrl,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "ERROR",
        database: "DISCONNECTED",
        datasource: maskedUrl,
        errorMessage: error?.message || String(error),
        errorCode: error?.code,
      },
      { status: 500 }
    );
  }
}
