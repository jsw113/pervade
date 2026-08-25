import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const keys = [
      "HERO_TITLE",
      "HERO_SUBTITLE",
      "HERO_BG_TYPE",
      "HERO_BG_URL",
      "HERO_VISIBLE",
      "HERO_SHOW_TEXT",
      "HERO_SHOW_CTA",
      "HOME_SECTIONS_ORDER",
      "LOGO_URL",
      "LOGO_FONT",
      "WHY_TITLE",
      "WHY_SUBTITLE",
      "WHY_CARD1_TITLE",
      "WHY_CARD1_DESC",
      "WHY_CARD2_TITLE",
      "WHY_CARD2_DESC",
      "WHY_CARD3_TITLE",
      "WHY_CARD3_DESC"
    ];
    const policies = await prisma.policy.findMany({
      where: { key: { in: keys } }
    });

    const config: Record<string, string> = {};
    keys.forEach(k => {
      config[k] = policies.find(p => p.key === k)?.value || "";
    });

    return new NextResponse(JSON.stringify(config), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      }
    });
  } catch (error: any) {
    console.error("Failed to fetch theme settings:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const keys = [
      "HERO_TITLE",
      "HERO_SUBTITLE",
      "HERO_BG_TYPE",
      "HERO_BG_URL",
      "HERO_VISIBLE",
      "HERO_SHOW_TEXT",
      "HERO_SHOW_CTA",
      "HOME_SECTIONS_ORDER",
      "LOGO_URL",
      "LOGO_FONT",
      "WHY_TITLE",
      "WHY_SUBTITLE",
      "WHY_CARD1_TITLE",
      "WHY_CARD1_DESC",
      "WHY_CARD2_TITLE",
      "WHY_CARD2_DESC",
      "WHY_CARD3_TITLE",
      "WHY_CARD3_DESC"
    ];

    // Individual upserts for rock-solid reliability
    for (const key of keys) {
      if (body[key] !== undefined) {
        const val = String(body[key] ?? "");
        await prisma.policy.upsert({
          where: { key },
          update: { value: val },
          create: { key, value: val, description: `Main Theme ${key}` }
        });
      }
    }

    // Revalidate paths for instant reflect
    try {
      revalidatePath("/");
      revalidatePath("/admin/theme");
      revalidatePath("/shop");
    } catch (e) {
      console.warn("Revalidation warning:", e);
    }

    return NextResponse.json({ success: true, message: "테마 설정이 성공적으로 저장되었습니다." });
  } catch (error: any) {
    console.error("Failed to save theme settings:", error);
    return NextResponse.json({ error: error?.message || "테마 설정 저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}
