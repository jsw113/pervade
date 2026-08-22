import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await prisma.inventoryLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const channelOrders = await prisma.channelOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Calculate financial stats
    let totalSalesAmount = 0;
    let totalPurchaseAmount = 0;
    let issuedCount = 0;
    let unissuedCount = 0;

    for (const log of logs) {
      if (log.type === "OUT") {
        totalSalesAmount += log.totalAmount || (log.unitPrice ? log.unitPrice * log.quantity : 0);
      } else if (log.type === "IN") {
        totalPurchaseAmount += log.totalAmount || (log.unitPrice ? log.unitPrice * log.quantity : 0);
      }

      if (log.taxInvoiceStatus === "ISSUED") issuedCount++;
      else if (log.taxInvoiceStatus === "UNISSUED") unissuedCount++;
    }

    for (const order of channelOrders) {
      if (order.taxInvoiceStatus === "ISSUED") issuedCount++;
      else if (order.taxInvoiceStatus === "UNISSUED") unissuedCount++;
    }

    const estimatedVatPayable = Math.round((totalSalesAmount - totalPurchaseAmount) * 0.1);

    return NextResponse.json({
      success: true,
      stats: {
        totalSalesAmount,
        totalPurchaseAmount,
        netRevenue: totalSalesAmount - totalPurchaseAmount,
        estimatedVatPayable: Math.max(0, estimatedVatPayable),
        issuedCount,
        unissuedCount,
      },
      recentLogs: logs,
    });
  } catch (error: any) {
    console.error("Tax invoices GET error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch tax invoice data" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, targetType, taxInvoiceStatus, taxInvoiceNumber, memo } = body;

    if (!id) {
      return NextResponse.json({ error: "항목 ID가 필요합니다." }, { status: 400 });
    }

    if (targetType === "CHANNEL_ORDER") {
      const order = await prisma.channelOrder.update({
        where: { id },
        data: {
          taxInvoiceStatus: taxInvoiceStatus || "ISSUED",
          taxInvoiceNumber: taxInvoiceNumber?.trim() || null,
          ...(memo ? { memo: memo.trim() } : {}),
        },
      });
      return NextResponse.json({ success: true, order });
    } else {
      const log = await prisma.inventoryLog.update({
        where: { id },
        data: {
          taxInvoiceStatus: taxInvoiceStatus || "ISSUED",
          taxInvoiceNumber: taxInvoiceNumber?.trim() || null,
          taxInvoiceDate: new Date(),
          ...(memo ? { memo: memo.trim() } : {}),
        },
      });
      return NextResponse.json({ success: true, log });
    }
  } catch (error: any) {
    console.error("Tax invoice PATCH error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update tax invoice" }, { status: 500 });
  }
}
