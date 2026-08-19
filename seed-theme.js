const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.policy.createMany({
    data: [
      { key: 'HERO_TITLE', value: '완벽한 깨끗함,\n당신의 공간을 깨우다' },
      { key: 'HERO_SUBTITLE', value: '퍼베이드 다목적 세정제는 강력한 세정력과 안전한 성분으로 집안 곳곳의 찌든 때를 말끔히 지워줍니다.' },
      { key: 'HERO_BG_TYPE', value: 'VIDEO' },
      { key: 'HERO_BG_URL', value: 'https://cdn.pixabay.com/video/2021/08/18/85424-590025732_large.mp4' },
      { key: 'HOME_SECTIONS_ORDER', value: JSON.stringify([{ id: 'hero', visible: true }, { id: 'features', visible: true }, { id: 'products', visible: true }]) }
    ]
  });
  console.log('Seeded');
}
main().catch(console.error).finally(() => prisma.$disconnect());
