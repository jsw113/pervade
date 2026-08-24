import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  return await prisma.user.findFirst({ where: { id: userId } });
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    if (!user.realNameVerified) {
      return NextResponse.json({ 
        error: "안전한 전자상거래를 위해 본인인증(실명인증)이 필요합니다.",
        needVerification: true 
      }, { status: 403 });
    }

    const body = await request.json();
    const { 
      productId, 
      optionSelected, 
      shippingMethod, 
      shippingFee, 
      totalAmount, 
      fromCart,
      shippingAddress,
      saveAsDefaultAddress,
      deliveryMemo,
      paymentMethod,
      usedPoints
    } = body;

    // Auto-update user default address if toggled or user address was empty
    if (shippingAddress && (saveAsDefaultAddress || !user.address)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { address: shippingAddress }
      });
    }

    // Deduct used points if any
    if (usedPoints && typeof usedPoints === "number" && usedPoints > 0) {
      const validPoints = Math.min(usedPoints, user.referralPoints || 0);
      if (validPoints > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { referralPoints: { decrement: validPoints } }
        });
      }
    }

    let ordersCreated = [];
    let orderGrandTotal = 0;

    if (fromCart) {
      // 1. Get all cart items
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: { product: true }
      });

      if (cartItems.length === 0) {
        return NextResponse.json({ error: "장바구니가 비어 있습니다." }, { status: 400 });
      }

      // 2. Create order & deduct stock
      for (const item of cartItems) {
        const extraCost = item.optionSelected?.includes("+5,000") ? 5000 : 0;
        const itemAmount = (item.product.price + extraCost) * item.quantity;
        orderGrandTotal += itemAmount;

        const order = await prisma.order.create({
          data: {
            userId: user.id,
            productId: item.productId,
            optionSelected: item.optionSelected,
            shippingMethod: item.shippingMethod,
            shippingFee: item.product.shippingFee,
            totalAmount: itemAmount,
            status: "COMPLETED"
          }
        });
        ordersCreated.push(order);

        // Deduct inventory & record log
        const updatedProduct = await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });

        await prisma.inventoryLog.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: item.quantity,
            balance: updatedProduct.stock,
            reason: `자사몰 주문 출고 (주문번호: ${order.id.slice(0, 8)}, 결제수단: ${paymentMethod || "신용카드"})`
          }
        });
      }

      // 3. Clear cart
      await prisma.cartItem.deleteMany({
        where: { userId: user.id }
      });

    } else {
      // Direct checkout
      if (!productId || !totalAmount) {
        return NextResponse.json({ error: "상품 및 결제 금액 정보가 누락되었습니다." }, { status: 400 });
      }

      const product = await prisma.product.findUnique({ where: { id: productId } });
      const currentShipping = shippingFee !== undefined ? parseInt(shippingFee) : (product?.shippingFee || 3000);
      const grand = parseInt(totalAmount);
      orderGrandTotal = grand;

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          productId,
          optionSelected: optionSelected || "기본 패키지 단품",
          shippingMethod: shippingMethod || "일반택배",
          shippingFee: currentShipping,
          totalAmount: grand,
          status: "COMPLETED"
        }
      });
      ordersCreated.push(order);

      // Deduct inventory & record log
      if (product) {
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: { stock: { decrement: 1 } }
        });

        await prisma.inventoryLog.create({
          data: {
            productId,
            type: "OUT",
            quantity: 1,
            balance: updatedProduct.stock,
            reason: `자사몰 바로결제 출고 (주문번호: ${order.id.slice(0, 8)}, 결제수단: ${paymentMethod || "신용카드"})`
          }
        });
      }
    }

    // 4. Update user totalPurchases
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalPurchases: { increment: orderGrandTotal }
      }
    });

    return NextResponse.json({ 
      success: true, 
      orders: ordersCreated,
      paymentMethod: paymentMethod || "신용/체크카드",
      deliveryMemo: deliveryMemo || "문 앞에 놓아주세요",
      shippingAddress: shippingAddress || user.address
    });
  } catch (error) {
    console.error("Failed to checkout:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
