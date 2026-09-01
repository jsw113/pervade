import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { sendOrderNotification } from "@/lib/notification";

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

    const body = await request.json();
    const {
      paymentKey,
      orderId,
      amount,
      productId,
      optionSelected,
      shippingMethod,
      shippingFee,
      fromCart,
      shippingAddress,
      saveAsDefaultAddress,
      deliveryMemo,
      paymentMethod,
      usedPoints
    } = body;

    if (!paymentKey || !orderId || amount === undefined) {
      return NextResponse.json({ error: "토스페이먼츠 승인 정보(paymentKey, orderId, amount)가 누락되었습니다." }, { status: 400 });
    }

    // 1. Fetch Toss Secret Key from DB Policy
    const policies = await prisma.policy.findMany();
    const secretKey = policies.find(p => p.key === "TOSS_SECRET_KEY")?.value || "test_gsk_docs_OaPzBL5KdmQXkzRz3y47BMW6";

    // 2. Call Toss Payments Confirm API
    const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount)
      })
    });

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      console.error("Toss Confirm Error:", tossData);
      return NextResponse.json({
        error: tossData.message || "토스페이먼츠 결제 승인에 실패했습니다.",
        code: tossData.code
      }, { status: tossResponse.status || 400 });
    }

    // 3. Payment approved! Now create the order in DB
    if (shippingAddress && (saveAsDefaultAddress || !user.address)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { address: shippingAddress }
      });
    }

    // Deduct used points
    if (usedPoints && typeof usedPoints === "number" && usedPoints > 0) {
      const validPoints = Math.min(usedPoints, user.referralPoints || 0);
      if (validPoints > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { referralPoints: { decrement: validPoints } }
        });
      }
    }

    let ordersCreated: any[] = [];
    let orderGrandTotal = 0;
    let notificationItems: Array<{ name: string; option?: string; quantity: number; price: number }> = [];

    const finalPaymentMethod = tossData.method || paymentMethod || "신용/체크카드 (토스페이먼츠)";

    if (fromCart) {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: { product: true }
      });

      if (cartItems.length === 0) {
        return NextResponse.json({ error: "장바구니가 비어 있습니다." }, { status: 400 });
      }

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

        notificationItems.push({
          name: item.product.name,
          option: item.optionSelected || undefined,
          quantity: item.quantity,
          price: item.product.price + extraCost,
        });

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
            reason: `토스페이먼츠 결제 출고 (주문: ${order.id.slice(0, 8)}, 승인키: ${paymentKey.slice(0, 10)}...)`
          }
        });
      }

      await prisma.cartItem.deleteMany({
        where: { userId: user.id }
      });
    } else {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      const currentShipping = shippingFee !== undefined ? parseInt(shippingFee) : (product?.shippingFee || 3000);
      const grand = Number(amount);
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

      notificationItems.push({
        name: product?.name || "PERVADE 프리미엄 상품",
        option: optionSelected || undefined,
        quantity: 1,
        price: grand,
      });

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
            reason: `토스페이먼츠 바로결제 출고 (주문: ${order.id.slice(0, 8)}, 승인키: ${paymentKey.slice(0, 10)}...)`
          }
        });
      }
    }

    // Update user totalPurchases
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalPurchases: { increment: orderGrandTotal }
      }
    });

    // Send CRM & Notification
    const mainOrderId = ordersCreated[0]?.id || orderId;
    const earnedPoints = Math.round(orderGrandTotal * 0.05);

    try {
      await sendOrderNotification(user.id, {
        orderNumber: mainOrderId,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone,
        items: notificationItems,
        totalAmount: orderGrandTotal,
        paymentMethod: finalPaymentMethod,
        shippingAddress: shippingAddress || user.address || "기본 등록 배송지",
        deliveryMemo: deliveryMemo || "문 앞에 놓아주세요",
        earnedPoints,
        orderDate: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      });
    } catch (notifErr) {
      console.error("Order notification error:", notifErr);
    }

    return NextResponse.json({
      success: true,
      orders: ordersCreated,
      paymentMethod: finalPaymentMethod,
      tossData,
      deliveryMemo: deliveryMemo || "문 앞에 놓아주세요",
      shippingAddress: shippingAddress || user.address
    });
  } catch (error: any) {
    console.error("Toss confirm internal error:", error);
    return NextResponse.json({ error: "결제 처리 중 서버 오류가 발생했습니다: " + error?.message }, { status: 500 });
  }
}
