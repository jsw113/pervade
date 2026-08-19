import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const policies = await prisma.policy.findMany();
    const map: Record<string, string> = {};
    policies.forEach((p) => {
      map[p.key] = p.value;
    });
    return NextResponse.json(map);
  } catch (error) {
    console.error("Fetch policies error:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
