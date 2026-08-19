import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value || null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    const whereClause = productId ? { productId } : {};

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, price: true } }
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, rating, content } = body;

    if (!productId || !rating || !content) {
      return NextResponse.json({ error: "Product ID, rating, and content are required" }, { status: 400 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: parseInt(rating),
        content,
      },
      include: {
        user: true,
        product: true
      }
    });

    // Check review reward policies
    const policies = await prisma.policy.findMany();
    const enabled = policies.find(p => p.key === "REVIEW_REWARD_ENABLED")?.value === "true";
    const percent = parseFloat(policies.find(p => p.key === "REVIEW_REWARD_PERCENTAGE")?.value || "1.0");

    if (enabled) {
      const rewardPoints = Math.round(review.product.price * (percent / 100));
      
      // Update user points
      await prisma.user.update({
        where: { id: userId },
        data: {
          referralPoints: { increment: rewardPoints }
        }
      });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Failed to submit review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
