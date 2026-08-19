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
    console.error("Admin fetch policies error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Support batch update: { policies: { KEY1: VAL1, KEY2: VAL2, ... } }
    if (body.policies && typeof body.policies === "object") {
      const updates = Object.entries(body.policies).map(([key, value]) =>
        prisma.policy.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      );
      await Promise.all(updates);
      return NextResponse.json({ success: true });
    }

    // Support single key-value: { key, value }
    const { key, value } = body;
    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const policy = await prisma.policy.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    return NextResponse.json(policy);
  } catch (error) {
    console.error("Failed to update policy:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
