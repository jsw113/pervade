import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const keys = ["HERO_TITLE", "HERO_SUBTITLE", "HERO_BG_TYPE", "HERO_BG_URL", "HOME_SECTIONS_ORDER", "LOGO_URL", "LOGO_FONT"];
    const policies = await prisma.policy.findMany({
      where: { key: { in: keys } }
    });

    const config: Record<string, string> = {};
    keys.forEach(k => {
      config[k] = policies.find(p => p.key === k)?.value || "";
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to fetch theme settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const keys = ["HERO_TITLE", "HERO_SUBTITLE", "HERO_BG_TYPE", "HERO_BG_URL", "HOME_SECTIONS_ORDER", "LOGO_URL", "LOGO_FONT"];

    for (const key of keys) {
      if (body[key] !== undefined) {
        await prisma.policy.upsert({
          where: { key },
          update: { value: String(body[key]) },
          create: { key, value: String(body[key]), description: `Main Theme ${key}` }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save theme settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
