import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value || null;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("Failed to fetch cart items:", error);
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
    const { productId, optionSelected, shippingMethod, quantity } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
        optionSelected: optionSelected || "기본 패키지 단품",
      }
    });

    let cartItem;
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + (quantity || 1),
          shippingMethod: shippingMethod || existing.shippingMethod,
        }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          optionSelected: optionSelected || "기본 패키지 단품",
          shippingMethod: shippingMethod || "일반택배",
          quantity: quantity || 1,
        }
      });
    }

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Failed to add to cart:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, quantity } = body;

    if (!id || typeof quantity !== "number") {
      return NextResponse.json({ error: "Item ID and valid quantity required" }, { status: 400 });
    }

    if (quantity <= 0) {
      // Delete if quantity is 0 or negative
      await prisma.cartItem.delete({
        where: { id, userId }
      });
      return NextResponse.json({ success: true, deleted: true });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id, userId },
      data: { quantity },
      include: { product: true }
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Failed to update cart item quantity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get("id");

    if (cartItemId) {
      await prisma.cartItem.delete({
        where: { id: cartItemId, userId }
      });
    } else {
      await prisma.cartItem.deleteMany({
        where: { userId }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete cart item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
