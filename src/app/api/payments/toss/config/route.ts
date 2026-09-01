import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const policies = await prisma.policy.findMany();
    const getVal = (k: string, d: string) => policies.find(p => p.key === k)?.value || d;

    const enabled = getVal("TOSS_PAYMENT_ENABLED", "true") === "true";
    const mode = getVal("TOSS_PG_MODE", "TEST");
    const clientKey = getVal("TOSS_CLIENT_KEY", "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm");

    return NextResponse.json({
      enabled,
      mode,
      clientKey
    });
  } catch (error) {
    console.error("Failed to fetch toss config:", error);
    return NextResponse.json({
      enabled: true,
      mode: "TEST",
      clientKey: "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"
    });
  }
}
