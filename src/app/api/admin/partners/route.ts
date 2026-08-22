import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_PARTNER_SEEDS = [
  {
    name: "네이버 스마트스토어 (퍼베이드 공식)",
    type: "SALES",
    channelType: "ONLINE_MALL",
    contact: "1588-3819",
    memo: "네이버 커머스 온라인 판매 채널 (정산 주기: 구매확정 후 D+1)",
  },
  {
    name: "쿠팡 윙/로켓 (Coupang Wing)",
    type: "SALES",
    channelType: "ONLINE_MALL",
    contact: "1544-7700",
    memo: "쿠팡 오픈마켓 및 로켓그로스 판매 채널",
  },
  {
    name: "성수동 플래그십 팝업스토어",
    type: "SALES",
    channelType: "OFFLINE_STORE",
    contact: "02-1234-5678",
    memo: "오프라인 현장 카드/현금 결제 및 샘플 출고",
  },
  {
    name: "리빙셀렉트 도매유통 (B2B)",
    type: "SALES",
    channelType: "B2B_WHOLESALE",
    bizNumber: "105-86-12345",
    ceoName: "김도매",
    contact: "010-9876-5432",
    email: "b2b@livingselect.co.kr",
    memo: "수도권 리빙 편집샵 도매 납품처 (세금계산서 월말 합산발행)",
  },
  {
    name: "(주)한국보틀 & 패키지",
    type: "PURCHASE",
    channelType: "RAW_MATERIAL",
    bizNumber: "214-81-67890",
    ceoName: "박용기",
    contact: "031-789-0123",
    email: "tax@koreabottle.co.kr",
    memo: "500ml 친환경 재활용 PET 공병 및 에코 파우치 공급처",
  },
  {
    name: "(주)그린케미칼 바이오",
    type: "PURCHASE",
    channelType: "MANUFACTURER",
    bizNumber: "305-88-45678",
    ceoName: "이케미",
    contact: "02-555-4321",
    email: "account@greenchemical.kr",
    memo: "식물유래 코코넛 계면활성제 및 천연 에센셜 오일 원료 제조사",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "SALES", "PURCHASE", or null

    let partners = await prisma.partner.findMany({
      where: type ? { type: { in: [type, "BOTH"] } } : {},
      orderBy: { createdAt: "desc" },
    });

    // Auto-seed if empty
    if (partners.length === 0) {
      for (const seed of DEFAULT_PARTNER_SEEDS) {
        await prisma.partner.create({ data: seed });
      }
      partners = await prisma.partner.findMany({
        where: type ? { type: { in: [type, "BOTH"] } } : {},
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(partners);
  } catch (error: any) {
    console.error("Partners GET error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch partners" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, channelType, bizNumber, ceoName, contact, email, address, memo } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "거래처명을 입력해주세요." }, { status: 400 });
    }

    const partner = await prisma.partner.create({
      data: {
        name: name.trim(),
        type: type || "SALES",
        channelType: channelType || "ONLINE_MALL",
        bizNumber: bizNumber?.trim() || null,
        ceoName: ceoName?.trim() || null,
        contact: contact?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        memo: memo?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    console.error("Partner POST error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create partner" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, type, channelType, bizNumber, ceoName, contact, email, address, memo } = body;

    if (!id) {
      return NextResponse.json({ error: "거래처 ID가 필요합니다." }, { status: 400 });
    }

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        name: name?.trim(),
        type,
        channelType,
        bizNumber: bizNumber?.trim() || null,
        ceoName: ceoName?.trim() || null,
        contact: contact?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null,
        memo: memo?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    console.error("Partner PATCH error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update partner" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "삭제할 거래처 ID가 필요합니다." }, { status: 400 });
    }

    await prisma.partner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Partner DELETE error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete partner" }, { status: 500 });
  }
}
