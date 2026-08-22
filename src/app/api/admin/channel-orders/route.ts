import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_CHANNEL_ORDERS = [
  {
    channel: "NAVER",
    channelOrderNo: "20260822-N0091823",
    productName: "퍼베이드 올인원 프리미엄 다목적 세정제 500ml (본품)",
    quantity: 2,
    unitPrice: 18900,
    totalPrice: 37800,
    buyerName: "이지은",
    buyerPhone: "010-3344-5566",
    receiverName: "이지은",
    receiverPhone: "010-3344-5566",
    shippingAddress: "서울특별시 마포구 월드컵북로 120, 302호",
    shippingCarrier: "CJ대한통운",
    trackingNumber: "654812390123",
    status: "SHIPPED",
    taxInvoiceStatus: "EXEMPT", // 네이버 스마트스토어는 신용카드/현금영수증 지출증빙
    memo: "네이버 스마트스토어 결제 완료 주문",
  },
  {
    channel: "COUPANG",
    channelOrderNo: "CP-20260822-77182",
    productName: "퍼베이드 친환경 에코 리필 1,000ml (대용량 2회분)",
    quantity: 1,
    unitPrice: 24000,
    totalPrice: 24000,
    buyerName: "박민수",
    buyerPhone: "010-7788-9900",
    receiverName: "박민수",
    receiverPhone: "010-7788-9900",
    shippingAddress: "경기도 성남시 분당구 판교역로 235, 10층",
    shippingCarrier: "CJ대한통운",
    trackingNumber: "654812390456",
    status: "PREPARING",
    taxInvoiceStatus: "EXEMPT",
    memo: "쿠팡 윙 오픈마켓 주문",
  },
  {
    channel: "B2B",
    channelOrderNo: "B2B-20260822-01",
    productName: "퍼베이드 올인원 프리미엄 다목적 세정제 500ml (본품)",
    quantity: 50,
    unitPrice: 12000,
    totalPrice: 600000,
    buyerName: "(주)리빙셀렉트 유통사업부",
    buyerPhone: "010-9876-5432",
    receiverName: "김도매 팀장",
    receiverPhone: "010-9876-5432",
    shippingAddress: "인천광역시 서구 가좌로 80, 물류센터 2동",
    shippingCarrier: "CJ대한통운",
    trackingNumber: "654812390789",
    status: "DELIVERED",
    taxInvoiceStatus: "ISSUED",
    taxInvoiceNumber: "20260822-41000021-99881122",
    memo: "리빙 편집샵 5개 지점 진열 납품 (전자세금계산서 발행 완료)",
  },
  {
    channel: "OFFLINE",
    channelOrderNo: "POPUP-20260822-004",
    productName: "퍼베이드 올인원 프리미엄 다목적 세정제 500ml (본품)",
    quantity: 4,
    unitPrice: 18900,
    totalPrice: 75600,
    buyerName: "성수동 팝업 현장구매",
    buyerPhone: "010-5555-1234",
    receiverName: "현장수령",
    shippingCarrier: "현장수령/직접배송",
    status: "DELIVERED",
    taxInvoiceStatus: "CASH_RECEIPT",
    memo: "성수동 플래그십 팝업스토어 현장 카드 결제",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get("channel");
    const status = searchParams.get("status");
    const taxInvoiceStatus = searchParams.get("taxInvoiceStatus");
    const search = searchParams.get("search");

    const where: any = {};
    if (channel && channel !== "ALL") where.channel = channel;
    if (status && status !== "ALL") where.status = status;
    if (taxInvoiceStatus && taxInvoiceStatus !== "ALL") where.taxInvoiceStatus = taxInvoiceStatus;
    if (search) {
      where.OR = [
        { buyerName: { contains: search } },
        { productName: { contains: search } },
        { channelOrderNo: { contains: search } },
        { trackingNumber: { contains: search } },
        { taxInvoiceNumber: { contains: search } },
      ];
    }

    let orders = await prisma.channelOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    if (orders.length === 0 && !channel && !search) {
      for (const seed of DEFAULT_CHANNEL_ORDERS) {
        await prisma.channelOrder.create({ data: seed });
      }
      orders = await prisma.channelOrder.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Channel orders GET error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      channel,
      channelOrderNo,
      productName,
      productId,
      quantity,
      unitPrice,
      totalPrice,
      buyerName,
      buyerPhone,
      receiverName,
      receiverPhone,
      shippingAddress,
      shippingCarrier,
      trackingNumber,
      status,
      taxInvoiceStatus,
      taxInvoiceNumber,
      memo,
    } = body;

    if (!productName?.trim()) {
      return NextResponse.json({ error: "상품명을 입력해주세요." }, { status: 400 });
    }

    const orderQty = parseInt(quantity) || 1;
    const finalTotal = totalPrice ? parseInt(totalPrice) : (parseInt(unitPrice) || 0) * orderQty;

    const order = await prisma.channelOrder.create({
      data: {
        channel: channel || "OFFLINE",
        channelOrderNo: channelOrderNo?.trim() || `MANUAL-${Date.now()}`,
        productName: productName.trim(),
        productId: productId || null,
        quantity: orderQty,
        unitPrice: parseInt(unitPrice) || 0,
        totalPrice: finalTotal,
        buyerName: buyerName?.trim() || "수기 고객",
        buyerPhone: buyerPhone?.trim() || null,
        receiverName: receiverName?.trim() || buyerName?.trim() || null,
        receiverPhone: receiverPhone?.trim() || buyerPhone?.trim() || null,
        shippingAddress: shippingAddress?.trim() || null,
        shippingCarrier: shippingCarrier || "CJ대한통운",
        trackingNumber: trackingNumber?.trim() || null,
        status: status || "PAID",
        taxInvoiceStatus: taxInvoiceStatus || "UNISSUED",
        taxInvoiceNumber: taxInvoiceNumber?.trim() || null,
        memo: memo?.trim() || null,
      },
    });

    // Automatically deduct product stock if productId or matching product exists
    let matchedProduct = null;
    if (productId) {
      matchedProduct = await prisma.product.findUnique({ where: { id: productId } });
    } else {
      matchedProduct = await prisma.product.findFirst({
        where: { name: { contains: productName.substring(0, 8) } },
      });
    }

    if (matchedProduct) {
      const newStock = Math.max(0, matchedProduct.stock - orderQty);
      await prisma.product.update({
        where: { id: matchedProduct.id },
        data: { stock: newStock },
      });

      // Record in InventoryLog
      await prisma.inventoryLog.create({
        data: {
          productId: matchedProduct.id,
          type: "OUT",
          quantity: orderQty,
          balance: newStock,
          reason: `[${channel || "수기"}] ${buyerName || "고객"} 주문 출고 (${order.channelOrderNo})`,
          partnerName: channel === "NAVER" ? "네이버 스마트스토어" : channel === "COUPANG" ? "쿠팡" : channel === "B2B" ? buyerName : "오프라인/기타",
          channelType: channel || "OFFLINE",
          taxInvoiceStatus: taxInvoiceStatus || "UNISSUED",
          taxInvoiceNumber: taxInvoiceNumber || null,
          unitPrice: parseInt(unitPrice) || matchedProduct.price,
          totalAmount: finalTotal,
        },
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Channel order POST error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create channel order" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, trackingNumber, shippingCarrier, taxInvoiceStatus, taxInvoiceNumber, memo } = body;

    if (!id) {
      return NextResponse.json({ error: "주문 ID가 필요합니다." }, { status: 400 });
    }

    const order = await prisma.channelOrder.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber: trackingNumber?.trim() || null } : {}),
        ...(shippingCarrier ? { shippingCarrier } : {}),
        ...(taxInvoiceStatus ? { taxInvoiceStatus } : {}),
        ...(taxInvoiceNumber !== undefined ? { taxInvoiceNumber: taxInvoiceNumber?.trim() || null } : {}),
        ...(memo !== undefined ? { memo: memo?.trim() || null } : {}),
        ...(status === "SHIPPED" ? { shippedDate: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Channel order PATCH error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "삭제할 주문 ID가 필요합니다." }, { status: 400 });
    }

    await prisma.channelOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Channel order DELETE error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete order" }, { status: 500 });
  }
}
