import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Seed Products if empty or update categories
    const productCount = await prisma.product.count();
    let p1Id = "";
    let p2Id = "";

    if (productCount === 0) {
      const p1 = await prisma.product.create({
        data: {
          name: "퍼베이드 올인원 프리미엄 다목적 세정제 500ml (본품)",
          description: "주방 기름때, 욕실 물때, 가구 오염을 단 하나로 말끔히 세정하는 프리미엄 포뮬러",
          category: "세정제류",
          subCategory: "다목적/올인원",
          price: 18900,
          originalPrice: 23000,
          shippingFee: 3000,
          imageUrl: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=1000&auto=format&fit=crop",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop"
          ]),
          detailContent: "<h3>PERVADE ALL-IN-ONE MULTIPURPOSE CLEANER</h3><p>불필요한 계면활성제를 덜어내고 식물 유래 세정 성분으로 완성한 프리미엄 클리너입니다.</p><ul><li>99.9% 항균 시험 완료</li><li>피부 저자극 테스트 무자극 0.00 판정</li><li>은은하고 고급스러운 시트러스 우디 잔향</li></ul>",
          stock: 250,
          safetyStock: 20,
          isVisible: true,
        }
      });
      p1Id = p1.id;

      const p2 = await prisma.product.create({
        data: {
          name: "퍼베이드 친환경 에코 리필 1,000ml (대용량 2회분)",
          description: "플라스틱 사용량을 70% 줄인 친환경 대용량 파우치 리필 패키지",
          category: "기타·액세서리",
          subCategory: "에코 리필팩",
          price: 24000,
          originalPrice: 32000,
          shippingFee: 3000,
          imageUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1000&auto=format&fit=crop",
          images: JSON.stringify([
            "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=1000&auto=format&fit=crop"
          ]),
          detailContent: "<h3>지속 가능한 라이프스타일을 위한 스마트한 선택</h3><p>본품 용기에 2회 가득 채워 사용할 수 있는 경제적인 대용량 친환경 리필 파우치입니다.</p>",
          stock: 400,
          safetyStock: 30,
          isVisible: true,
        }
      });
      p2Id = p2.id;
    } else {
      // Update existing products with accurate 2-depth categories
      const existing = await prisma.product.findMany();
      for (const prod of existing) {
        if (!prod.category || prod.category === "기본" || !prod.subCategory) {
          if (prod.name.includes("리필")) {
            await prisma.product.update({
              where: { id: prod.id },
              data: { category: "기타·액세서리", subCategory: "에코 리필팩" }
            });
          } else {
            await prisma.product.update({
              where: { id: prod.id },
              data: { category: "세정제류", subCategory: "다목적/올인원" }
            });
          }
        }
      }
    }

    // 2. Seed Promotions if empty
    const promoCount = await prisma.promotion.count();
    if (promoCount === 0) {
      const now = new Date();
      const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      await prisma.promotion.createMany({
        data: [
          {
            title: "2026 썸머 클린 & 웰니스 스페셜 페스티벌",
            subtitle: "찌든 오염은 비우고 공간의 품격을 채우는 시간, 전 제품 특별 세트 구성 및 추가 리필 증정",
            badgeText: "SEASON SPECIAL",
            discountText: "최대 25% 할인 + 신규 가입 3,000P 즉시 증정",
            content: "· 다목적 세정제 500ml 본품 + 1,000ml 리필 세트 20% 특별 할인\n· 3만원 이상 구매 고객 전원 프리미엄 극세사 전용 클리닝 타월 증정\n· 실명인증 완료 회원 추가 5% 적립",
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

    // 3. Seed Guides if empty
    const guideCount = await prisma.guidePost.count();
    if (guideCount === 0) {
      await prisma.guidePost.createMany({
        data: [
          {
            title: "주방 인덕션 & 가스레인지 기름때 3분 완벽 세정법",
            category: "주방",
            summary: "눌어붙은 기름때와 탄 자국을 스크래치 없이 말끔하게 분해하는 퍼베이드 전용 클리닝 루틴",
            content: "1. 조리 직후 열기가 살짝 식은 상판에 퍼베이드를 2~3회 골고루 분사합니다.\n2. 오염이 심한 부위는 약 1~2분간 방치하여 세정 포뮬러가 오염물에 스며들도록 기다립니다.\n3. 동봉된 프리미엄 극세사 타월로 가볍게 원을 그리며 닦아냅니다.\n4. 마른 타월로 한 번 더 마무리하면 코팅 광택막이 형성되어 다음 오염이 잘 묻지 않습니다.",
            thumbnailUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop",
            images: JSON.stringify([
              "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=800&auto=format&fit=crop"
            ]),
            tips: "철수세미나 거친 패드는 인덕션 글라스에 미세 흠집을 유발하므로 반드시 부드러운 극세사 타월을 사용하세요.",
            published: true,
            productId: p1Id || null,
          },
          {
            title: "욕실 유리부스 & 수전 완고한 하얀 물때 제거 비법",
            category: "욕실",
            summary: "석회 성분으로 굳어진 샤워부스 유리와 수전의 물때를 자극 없이 투명하게 복원하는 노하우",
            content: "1. 물기가 마른 상태의 수전과 유리면에 퍼베이드를 충분히 분사합니다.\n2. 3분간 대기 후 부드러운 스펀지로 결을 따라 문질러줍니다.\n3. 미온수로 헹궈낸 뒤 마른 타월로 물기를 완전히 제거합니다.",
            thumbnailUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
            images: JSON.stringify([
              "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop"
            ]),
            tips: "세정 후 마른 타월로 물기를 닦아주시면 보호 코팅막이 유지되어 물방울 맺힘이 줄어듭니다.",
            published: true,
            productId: p1Id || null,
          },
          {
            title: "원목 가구 및 거실 소파 생활 얼룩 안심 케어 가이드",
            category: "리빙/가구",
            summary: "손때, 반려동물 발자국, 미세먼지로 칙칙해진 가구 표면을 원목 손상 없이 닦아내는 방법",
            content: "1. 타월에 퍼베이드를 1~2회 가볍게 분사하여 타월을 적십니다 (표면에 직접 과도 분사 지양).\n2. 가구 나뭇결 방향을 따라 부드럽게 닦아냅니다.\n3. 자연 건조시키면 은은한 원목 본연의 질감이 살아납니다.",
            thumbnailUrl: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=800&auto=format&fit=crop",
            images: JSON.stringify([
              "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=800&auto=format&fit=crop"
            ]),
            tips: "고가의 특수 마감 원목이나 천연 가죽의 경우 눈에 띄지 않는 모서리에 먼저 소량 테스트 후 사용하세요.",
            published: true,
            productId: p1Id || null,
          }
        ]
      });
    }

    // 4. Seed Policies if empty
    const defaultPolicies = [
      { key: "COMPANY_NAME", value: "(주)퍼베이드 (PERVADE Corp.)", description: "상호명" },
      { key: "CEO_NAME", value: "홍길동", description: "대표자명" },
      { key: "COMPANY_ADDRESS", value: "서울특별시 강남구 테헤란로 123, 퍼베이드타워 4층", description: "사업장 소재지" },
      { key: "BIZ_REG_NUMBER", value: "123-45-67890", description: "사업자등록번호" },
      { key: "ECOMMERCE_NUMBER", value: "2026-서울강남-1234호", description: "통신판매업신고번호" },
      { key: "PRIVACY_OFFICER", value: "홍길동 (privacy@pervade.co.kr)", description: "개인정보보호책임자" },
      { key: "CS_PHONE", value: "02-1234-5678", description: "고객센터 전화번호" },
      { key: "CS_HOURS", value: "평일 10:00 ~ 17:00 (점심 12:00 ~ 13:00 / 주말·공휴일 휴무)", description: "고객센터 운영시간" },
      { key: "TOP_BANNER_TEXT", value: "신규 가입 시 3,000P 적립 & 첫 구매 무료배송", description: "최상단 띠배너 문구" },
      { key: "TOP_BANNER_ENABLED", value: "true", description: "최상단 띠배너 활성화 여부" },
    ];

    for (const p of defaultPolicies) {
      await prisma.policy.upsert({
        where: { key: p.key },
        update: {},
        create: { key: p.key, value: p.value, description: p.description }
      });
    }

    return NextResponse.json({
      success: true,
      message: "클라우드 PostgreSQL 데이터베이스에 기본 상품(2-Depth 계열 분류 적용), 프로모션, 가이드 매거진, 운영 정책 시드가 성공적으로 완료되었습니다."
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
