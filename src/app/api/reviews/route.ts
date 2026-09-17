import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value || null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");

    const whereClause: any = {};
    if (productId) whereClause.productId = productId;
    if (userId) whereClause.userId = userId;

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, price: true, imageUrl: true } },
        order: { select: { id: true, createdAt: true, status: true, optionSelected: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = await request.json();
    const { productId, orderId, rating, content, imageUrl } = body;

    if (!productId || !rating || !content) {
      return NextResponse.json({ error: "상품 정보, 평점 및 후기 내용을 모두 입력해주세요." }, { status: 400 });
    }

    // 1. Prevent duplicate reviews for the same order
    if (orderId) {
      const existingReview = await prisma.review.findFirst({
        where: { orderId, userId }
      });
      if (existingReview) {
        return NextResponse.json({ error: "이미 해당 주문에 대한 구매후기를 작성하셨습니다." }, { status: 400 });
      }
    }

    const isPhoto = Boolean(imageUrl && imageUrl.trim() !== "");

    // 2. Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        orderId: orderId || null,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        content: content.trim(),
        imageUrl: imageUrl ? imageUrl.trim() : null,
        isPhoto,
      },
      include: {
        user: true,
        product: true,
        order: true,
      }
    });

    // 3. Calculate reward points based on review policies (Text vs Photo)
    const policies = await prisma.policy.findMany();
    const enabled = policies.find(p => p.key === "REVIEW_REWARD_ENABLED")?.value !== "false";
    const textPercent = parseFloat(policies.find(p => p.key === "REVIEW_REWARD_PERCENTAGE")?.value || "1.0");
    const photoPercent = parseFloat(policies.find(p => p.key === "PHOTO_REVIEW_REWARD_PERCENTAGE")?.value || "2.0");

    let rewardPoints = 0;
    if (enabled) {
      const applicableRate = isPhoto ? photoPercent : textPercent;
      const basePrice = review.order?.totalAmount || review.product.price;
      rewardPoints = Math.max(100, Math.round(basePrice * (applicableRate / 100)));
      
      // Update user points
      await prisma.user.update({
        where: { id: userId },
        data: {
          referralPoints: { increment: rewardPoints }
        }
      });
    }

    return NextResponse.json({
      success: true,
      review,
      rewardPoints,
      isPhoto,
    });
  } catch (error) {
    console.error("Failed to submit review:", error);
    return NextResponse.json({ error: "구매후기 등록 중 오류가 발생했습니다." }, { status: 500 });
  }
}

