import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_RAW_MATERIALS = [
  {
    name: "500ml 친환경 리사이클 PET 공병",
    category: "CONTAINER",
    unit: "개",
    currentStock: 2500,
    safetyStock: 500,
    unitCost: 450,
    supplierName: "(주)한국보틀 & 패키지",
  },
  {
    name: "프리미엄 2단 미세안개 트리거 스프레이건",
    category: "SPRAY",
    unit: "개",
    currentStock: 1800,
    safetyStock: 400,
    unitCost: 650,
    supplierName: "(주)한국보틀 & 패키지",
  },
  {
    name: "코코넛 유래 비이온 천연 계면활성제 원료 (APG)",
    category: "RAW_INGREDIENT",
    unit: "kg",
    currentStock: 450,
    safetyStock: 100,
    unitCost: 12000,
    supplierName: "(주)그린케미칼 바이오",
  },
  {
    name: "퍼베이드 시그니처 시트러스 우디 에센셜 블렌드 오일",
    category: "RAW_INGREDIENT",
    unit: "L",
    currentStock: 85,
    safetyStock: 20,
    unitCost: 85000,
    supplierName: "(주)그린케미칼 바이오",
  },
  {
    name: "1,000ml 대용량 에코 스탠딩 파우치 패키지",
    category: "CONTAINER",
    unit: "개",
    currentStock: 1200,
    safetyStock: 300,
    unitCost: 380,
    supplierName: "(주)한국보틀 & 패키지",
  },
  {
    name: "퍼베이드 본품 전용 친환경 크라프트 배송 박스 (소형)",
    category: "PACKAGE",
    unit: "개",
    currentStock: 3000,
    safetyStock: 600,
    unitCost: 550,
    supplierName: "(주)삼원팩 패키징",
  },
];

export async function GET() {
  try {
    let materials = await prisma.rawMaterial.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (materials.length === 0) {
      for (const seed of DEFAULT_RAW_MATERIALS) {
        await prisma.rawMaterial.create({ data: seed });
      }
      materials = await prisma.rawMaterial.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(materials);
  } catch (error: any) {
    console.error("Materials GET error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch materials" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, unit, currentStock, safetyStock, unitCost, supplierId, supplierName } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "원재료/부자재명을 입력해주세요." }, { status: 400 });
    }

    const material = await prisma.rawMaterial.create({
      data: {
        name: name.trim(),
        category: category || "CONTAINER",
        unit: unit?.trim() || "개",
        currentStock: parseInt(currentStock) || 0,
        safetyStock: parseInt(safetyStock) || 50,
        unitCost: parseInt(unitCost) || 0,
        supplierId: supplierId || null,
        supplierName: supplierName?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, material });
  } catch (error: any) {
    console.error("Material POST error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create material" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, type, quantity, reason, name, category, unit, safetyStock, unitCost, supplierName, taxInvoiceNumber } = body;

    if (!id) {
      return NextResponse.json({ error: "원재료 ID가 필요합니다." }, { status: 400 });
    }

    const current = await prisma.rawMaterial.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "원재료를 찾을 수 없습니다." }, { status: 404 });
    }

    let newStock = current.currentStock;

    // Handle stock in/out adjustments
    if (type === "IN" && quantity) {
      newStock += parseInt(quantity);
    } else if (type === "OUT" && quantity) {
      newStock = Math.max(0, newStock - parseInt(quantity));
    } else if (type === "ADJUST" && quantity !== undefined) {
      newStock = parseInt(quantity);
    }

    const updated = await prisma.rawMaterial.update({
      where: { id },
      data: {
        currentStock: newStock,
        ...(name ? { name: name.trim() } : {}),
        ...(category ? { category } : {}),
        ...(unit ? { unit: unit.trim() } : {}),
        ...(safetyStock !== undefined ? { safetyStock: parseInt(safetyStock) } : {}),
        ...(unitCost !== undefined ? { unitCost: parseInt(unitCost) } : {}),
        ...(supplierName ? { supplierName: supplierName.trim() } : {}),
      },
    });

    // Create an inventory log entry if adjustment took place
    if (type && quantity) {
      await prisma.inventoryLog.create({
        data: {
          type: type === "IN" ? "IN" : type === "OUT" ? "OUT" : "ADJUST",
          quantity: parseInt(quantity),
          balance: newStock,
          reason: reason || `원재료 [${current.name}] ${type === "IN" ? "매입 입고" : "생산 출고/사용"}`,
          partnerName: supplierName || current.supplierName || "원재료 매입처",
          channelType: "SUPPLIER",
          taxInvoiceStatus: taxInvoiceNumber ? "ISSUED" : "UNISSUED",
          taxInvoiceNumber: taxInvoiceNumber || null,
          unitPrice: current.unitCost,
          totalAmount: current.unitCost * parseInt(quantity),
        },
      });
    }

    return NextResponse.json({ success: true, material: updated });
  } catch (error: any) {
    console.error("Material PATCH error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update material" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "삭제할 원재료 ID가 필요합니다." }, { status: 400 });
    }

    await prisma.rawMaterial.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Material DELETE error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete material" }, { status: 500 });
  }
}
