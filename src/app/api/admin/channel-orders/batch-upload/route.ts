import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { channel, orders } = body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: "업로드할 주문 데이터가 없습니다." }, { status: 400 });
    }

    let successCount = 0;
    const errors: string[] = [];

    // Find all products to match names
    const products = await prisma.product.findMany();

    for (const item of orders) {
      try {
        const productName = item.productName || item["상품명"] || "퍼베이드 세정제";
        const quantity = parseInt(item.quantity || item["수량"] || 1);
        const unitPrice = parseInt(item.unitPrice || item["판매가"] || item["단가"] || 0);
        const totalPrice = parseInt(item.totalPrice || item["총결제금액"] || item["결제금액"] || unitPrice * quantity);
        const buyerName = item.buyerName || item["주문자명"] || item["구매자명"] || "외부몰 고객";
        const buyerPhone = item.buyerPhone || item["주문자연락처"] || item["연락처"] || null;
        const receiverName = item.receiverName || item["수취인명"] || buyerName;
        const receiverPhone = item.receiverPhone || item["수취인연락처"] || buyerPhone;
        const shippingAddress = item.shippingAddress || item["배송지"] || item["기본배송지"] || null;
        const channelOrderNo = item.channelOrderNo || item["주문번호"] || `${channel || "SYNC"}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const trackingNumber = item.trackingNumber || item["송장번호"] || item["운송장번호"] || null;

        // Try matching product
        const matched = products.find((p) => p.name.includes(productName) || productName.includes(p.name));

        const createdOrder = await prisma.channelOrder.create({
          data: {
            channel: channel || item.channel || "NAVER",
            channelOrderNo,
            productName,
            productId: matched ? matched.id : null,
            quantity,
            unitPrice,
            totalPrice,
            buyerName,
            buyerPhone,
            receiverName,
            receiverPhone,
            shippingAddress,
            shippingCarrier: "CJ대한통운",
            trackingNumber,
            status: trackingNumber ? "SHIPPED" : "PREPARING",
            taxInvoiceStatus: "EXEMPT",
            memo: `${channel || "외부몰"} 엑셀 일괄 업로드 건`,
          },
        });

        // Deduct inventory if matched
        if (matched) {
          const newStock = Math.max(0, matched.stock - quantity);
          await prisma.product.update({
            where: { id: matched.id },
            data: { stock: newStock },
          });

          await prisma.inventoryLog.create({
            data: {
              productId: matched.id,
              type: "OUT",
              quantity,
              balance: newStock,
              reason: `[${channel || "외부몰"}] 엑셀 일괄 발주 출고 (${buyerName}님)`,
              partnerName: channel === "NAVER" ? "네이버 스마트스토어" : channel === "COUPANG" ? "쿠팡" : "외부몰",
              channelType: channel || "ONLINE_MALL",
              taxInvoiceStatus: "EXEMPT",
              unitPrice: unitPrice || matched.price,
              totalAmount: totalPrice,
            },
          });
        }

        successCount++;
      } catch (rowErr: any) {
        errors.push(rowErr?.message || "행 처리 실패");
      }
    }

    return NextResponse.json({
      success: true,
      total: orders.length,
      successCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Batch upload error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process batch upload" }, { status: 500 });
  }
}
