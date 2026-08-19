import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Seed initial promotion if table is empty
    const count = await prisma.promotion.count();
    if (count === 0) {
      const now = new Date();
      const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      await prisma.promotion.createMany({
        data: [
          {
            title: "2026 썸머 클린 & 웰니스 스페셜 페스티벌",
            subtitle: "찌든 오염은 비우고 공간의 품격을 채우는 시간, 전 제품 특별 세트 구성 및 추가 리필 증정",
            badgeText: "SEASON SPECIAL",
            discountText: "최대 25% 할인 + 신규 가입 3,000P 즉시 증정",
            content: "· 다목적 세정제 500ml 본품 + 500ml 리필 2팩 세트 20% 특별 할인\n· 3만원 이상 구매 고객 전원 프리미엄 극세사 전용 클리닝 타월 증정\n· 실명인증 완료 회원 추가 5% 적립",
            imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1200&auto=format&fit=crop",
            linkUrl: "/shop",
            buttonText: "프로모션 특별 세트 바로가기",
            startDate: now,
            endDate: inTwoWeeks,
            isActive: true,
            order: 1,
          },
          {
            title: "[종료] 퍼베이드 론칭 기념 얼리버드 웰컴 위크",
            subtitle: "공간을 깨우는 순수 자연의 세정력, 퍼베이드 공식 론칭 기념 특별 혜택",
            badgeText: "EVENT CLOSED",
            discountText: "얼리버드 론칭 혜택 (종료)",
            content: "많은 성원에 힘입어 얼리버드 이벤트가 성공적으로 마감되었습니다. 다음 시즌 프로모션을 기대해 주세요.",
            imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop",
            linkUrl: "/shop",
            buttonText: "전체 상품 둘러보기",
            startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            isActive: false,
            order: 2,
          }
        ]
      });
    }

    const promotions = await prisma.promotion.findMany({
      orderBy: { order: "asc" }
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Fetch promotions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
