const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update/Upsert products
  const products = [
    {
      id: "cleaner",
      name: "퍼베이드 다목적 세정제",
      price: 15000,
      originalPrice: 20000,
      shippingFee: 0,
      description: "찌든 때부터 기름때까지 한 번에 지우는 강력한 세정제. 자연 유래 성분으로 안전하게 사용하세요.",
      imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300",
      stock: 100,
      isVisible: true
    },
    {
      id: "refill",
      name: "퍼베이드 다목적 세정제 (리필용)",
      price: 12000,
      originalPrice: 15000,
      shippingFee: 3000,
      description: "환경을 생각하는 대용량 리필 패키지. 기존 용기에 리필하여 사용하세요.",
      imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=300",
      stock: 150,
      isVisible: true
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }

  // Seed Shipping Common Notice Policy
  await prisma.policy.upsert({
    where: { key: "SHIPPING_COMMON_NOTICE" },
    update: {
      value: `[배송 안내]
- 퍼베이드의 모든 제품은 안전한 친환경 에어 패키징으로 꼼꼼히 포장되어 안전하게 배송됩니다.
- 영업일 기준 오후 2시 이전 결제 완료 건은 당일 출고를 원칙으로 합니다.
- 배송 소요 기간은 전국 1~3일(영업일 기준) 소요되며, 택배사 사정에 따라 일부 변경될 수 있습니다.

[교환/반품 안내]
- 제품 수령 후 7일 이내에 교환 및 반품 신청이 가능합니다.
- 단순 변심으로 인한 교환 및 반품의 경우 왕복 배송비(6,000원)는 고객 부담입니다.
- 상품의 개봉 및 파손, 사용 흔적이 있는 경우에는 교환/반품이 불가능할 수 있으니 양해 부탁드립니다.
- 불량 또는 오배송의 경우 배송비는 퍼베이드가 전액 부담합니다.`
    },
    create: {
      key: "SHIPPING_COMMON_NOTICE",
      value: `[배송 안내]
- 퍼베이드의 모든 제품은 안전한 친환경 에어 패키징으로 꼼꼼히 포장되어 안전하게 배송됩니다.
- 영업일 기준 오후 2시 이전 결제 완료 건은 당일 출고를 원칙으로 합니다.
- 배송 소요 기간은 전국 1~3일(영업일 기준) 소요되며, 택배사 사정에 따라 일부 변경될 수 있습니다.

[교환/반품 안내]
- 제품 수령 후 7일 이내에 교환 및 반품 신청이 가능합니다.
- 단순 변심으로 인한 교환 및 반품의 경우 왕복 배송비(6,000원)는 고객 부담입니다.
- 상품의 개봉 및 파손, 사용 흔적이 있는 경우에는 교환/반품이 불가능할 수 있으니 양해 부탁드립니다.
- 불량 또는 오배송의 경우 배송비는 퍼베이드가 전액 부담합니다.`,
      description: "주문 및 배송 관련 공통 고지사항"
    }
  });

  console.log("Updated Products & Shipping Notice Seeded");
}

main().catch(console.error).finally(() => prisma.$disconnect());
