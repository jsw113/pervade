import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const productId = searchParams.get("productId");
    const search = searchParams.get("search");

    // Check if GuidePost is empty, if so seed initial rich posts!
    const count = await prisma.guidePost.count();
    if (count === 0) {
      const cleanerProduct = await prisma.product.findFirst();
      await prisma.guidePost.createMany({
        data: [
          {
            title: "주방 인덕션 & 가스레인지 찌든 기름때 5분 분해 세정법",
            category: "주방",
            summary: "매일 요리 후 눌어붙은 기름때와 탄 자국을 스크래치 없이 손쉽게 지우는 퍼베이드만의 전문가 세정 루틴.",
            content: `### 1단계: 온수 타월로 표면 불리기\n조리 직후 인덕션 상판의 열기가 식은 뒤, 미온수를 적신 타월로 1차 오염 부위를 가볍게 덮어줍니다.\n\n### 2단계: 퍼베이드 세정제 원액 분사\n기름때가 집중된 부위에 15~20cm 거리를 두고 골고루 2~3회 분사합니다. 폼이 유기물과 반응하여 기름 분자를 분해할 때까지 약 2분간 기다려주세요.\n\n### 3단계: 극세사 타월로 원을 그리듯 닦아내기\n부드러운 전용 극세사 타월로 안쪽에서 바깥쪽으로 부드럽게 문질러 닦아냅니다. 별도로 물로 헹굴 필요 없이 말끔한 광택이 살아납니다.`,
            thumbnailUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000&auto=format&fit=crop",
            tips: "· 탄 자국이 심한 경우 세정제를 도포한 후 랩을 씌워 5분간 방치하면 힘들이지 않고 닦아낼 수 있습니다.\n· 철수세미 사용은 상판 코팅을 손상시킬 수 있으므로 절대 삼가주세요.",
            productId: cleanerProduct?.id || null,
            published: true,
            viewCount: 142
          },
          {
            title: "욕실 수전 물때 & 샤워부스 유리 백화현상 완벽 클리어 가이드",
            category: "욕실",
            summary: "뿌옇게 흐려진 샤워부스와 얼룩덜룩한 수전에 본래의 호텔식 투명 광택을 되찾아주는 초간단 워터스팟 케어.",
            content: `### 1단계: 마른 표면에 직접 도포\n물기가 남아있으면 세정액이 희석되어 효과가 떨어질 수 있으므로, 환기 후 마른 상태의 수전과 유리에 분사합니다.\n\n### 2단계: 매직 스펀지로 가볍게 롤링\n부드러운 스펀지를 이용해 물때 굴곡을 따라 원을 그리며 펴 바릅니다. 산소 미세 버블이 칼슘 및 비누 찌꺼기를 녹여냅니다.\n\n### 3단계: 미온수 샤워 및 스퀴지 마무리\n샤워기로 시원하게 헹궈낸 뒤 스퀴지(유리닦이)로 물기를 긁어내면 물때 재착색 방지 보호막이 형성됩니다.`,
            thumbnailUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000&auto=format&fit=crop",
            tips: "· 수전의 틈새는 헌 칫솔에 세정제를 묻혀 닦으면 숨은 찌든 때까지 완벽히 제거됩니다.",
            productId: cleanerProduct?.id || null,
            published: true,
            viewCount: 98
          },
          {
            title: "가죽 소파 & 원목 가구 표면 먼지 및 유분기 안심 케어법",
            category: "리빙/가구",
            summary: "피부에 매일 닿는 거실 소파와 식탁 테이블을 화학 냄새 없이 뽀송하게 유지하는 저자극 클리닝 팁.",
            content: `### 1단계: 타월에 세정제 분사\n가구 표면에 직접 분사하기보다 극세사 타월에 1~2회 가볍게 분사하여 용액을 균일하게 적셔줍니다.\n\n### 2단계: 나뭇결/가죽 결 방향으로 닦아내기\n결을 따라 부드럽게 쓸어내리듯 닦아내어 표면의 유분과 미세먼지를 흡착합니다.\n\n### 3단계: 자연 건조\n끈적임 없이 즉시 휘발되며 은은한 자연 유래 아로마 잔향만 남습니다.`,
            thumbnailUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1000&auto=format&fit=crop",
            tips: "· 가죽 제품의 경우 눈에 띄지 않는 하단 모서리에 사전 테스트 후 전체 적용을 권장합니다.",
            productId: cleanerProduct?.id || null,
            published: true,
            viewCount: 65
          }
        ]
      });
    }

    const guides = await prisma.guidePost.findMany({
      where: {
        published: true,
        ...(category && category !== "전체" ? { category } : {}),
        ...(productId && productId !== "전체" ? { productId } : {}),
        ...(search ? {
          OR: [
            { title: { contains: search } },
            { summary: { contains: search } },
            { content: { contains: search } }
          ]
        } : {})
      },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { id: true, name: true, price: true, imageUrl: true }
        }
      }
    });

    return NextResponse.json(guides);
  } catch (error) {
    console.error("Fetch guides error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
