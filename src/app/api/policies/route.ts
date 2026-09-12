import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const policies = await prisma.policy.findMany();
    const map: Record<string, string> = {};
    policies.forEach((p) => {
      map[p.key] = p.value;
    });
    return new NextResponse(JSON.stringify(map), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("Fetch policies error:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
