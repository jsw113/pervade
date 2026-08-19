const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Seed Products
  const products = [
    {
      id: "cleaner",
      name: "퍼베이드 다목적 세정제",
      price: 15000,
      description: "찌든 때부터 기름때까지 한 번에 지우는 강력한 세정제. 자연 유래 성분으로 안전하게 사용하세요.",
      imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300",
      stock: 100,
      isVisible: true
    },
    {
      id: "refill",
      name: "퍼베이드 다목적 세정제 (리필용)",
      price: 12000,
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

  console.log('Products Seeded');
}

main().catch(console.error).finally(() => prisma.$disconnect());
