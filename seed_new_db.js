const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

const prisma = new PrismaClient();

async function main() {
  console.log('--- 1. Initializing Admin User ---');
  const adminPassHash = hashPassword('pervade_admin_2026!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pervade.co.kr' },
    update: {
      passwordHash: adminPassHash,
      role: 'SUPER_ADMIN',
      name: '최고관리자',
      loginId: 'admin'
    },
    create: {
      email: 'admin@pervade.co.kr',
      passwordHash: adminPassHash,
      name: '최고관리자',
      role: 'SUPER_ADMIN',
      loginId: 'admin'
    }
  });
  console.log('Admin ready:', admin.email);

  console.log('--- 2. Initializing Master Products ---');
  const products = [
    {
      id: 'prod-main-500',
      name: '퍼베이드 올인원 프리미엄 다목적 세정제 500ml (본품)',
      description: '주방의 찌든 기름때부터 욕실의 완고한 물때까지 표면 손상 없이 깊숙이 침투하여 즉각 분해하는 시그니처 세정제',
      price: 18900,
      originalPrice: 22000,
      category: '세정제류',
      subCategory: '다목적/올인원',
      imageUrl: '/uploads/products/prod_1787151309265_c1i6mj.JPG',
      images: JSON.stringify(['/uploads/products/prod_1787151309265_c1i6mj.JPG']),
      detailContent: '<h3>PERVADE ALL-IN-ONE MULTIPURPOSE CLEANER</h3><p>불필요한 계면활성제를 덜어내고 식물 유래 세정 성분으로 완성한 프리미엄 클리너입니다.</p><ul><li>99.9% 항균 시험 완료</li><li>피부 저자극 테스트 무자극 0.00 판정</li><li>은은하고 고급스러운 시트러스 우디 잔향</li></ul>',
      options: JSON.stringify([
        { id: "opt-main-1", name: "본품 500ml 1개 (스프레이건 포함)", extraPrice: 0, stock: 500 },
        { id: "opt-main-2", name: "본품 500ml 2개 듀오 세트 (10% 추가할인)", extraPrice: 17000, stock: 300 },
        { id: "opt-main-3", name: "본품 1개 + 에코 리필 1,000ml 스타터 세트", extraPrice: 21000, stock: 200 }
      ]),
      legalInfo: JSON.stringify({
        productName: "퍼베이드 올인원 다목적 세정제",
        productType: "일반생활화학제품(세정제)",
        manufacturer: "주식회사 퍼베이드",
        origin: "대한민국",
        volume: "500ml",
        mainIngredients: "식물유래 계면활성제(코코넛/옥수수 추출물), 정제수, 베이킹소다, 구연산, 천연 에센셜 오일",
        expiryDate: "제조일로부터 36개월 (개봉 후 12개월 권장)",
        cautions: "어린이의 손이 닿지 않는 곳에 보관하십시오. 용도 외에는 사용하지 마십시오."
      }),
      stock: 999,
      safetyStock: 20,
      shippingFee: 3000,
      isVisible: true,
    },
    {
      id: 'prod-refill-1000',
      name: '퍼베이드 친환경 에코 리필 1,000ml (대용량 2회분)',
      description: '플라스틱 사용을 줄이고 경제성을 높인 친환경 에코 스탠딩 파우치 대용량 리필',
      price: 24000,
      originalPrice: 28000,
      category: '기타·액세서리',
      subCategory: '에코 리필팩',
      imageUrl: '/uploads/products/prod_1787151393931_spxhav.JPG',
      images: JSON.stringify(['/uploads/products/prod_1787151393931_spxhav.JPG']),
      detailContent: '<h3>지속 가능한 라이프스타일을 위한 스마트한 선택</h3><p>본품 용기에 2회 가득 채워 사용할 수 있는 경제적인 대용량 친환경 리필 파우치입니다.</p><ul><li>플라스틱 배출량 70% 절감</li><li>따르기 편리한 안전 캡 스파우트 적용</li><li>본품과 동일한 고농축 식물 유래 안심 포뮬러</li></ul>',
      options: JSON.stringify([
        { id: "opt-refill-1", name: "에코 리필 1,000ml 1팩", extraPrice: 0, stock: 500 },
        { id: "opt-refill-2", name: "에코 리필 1,000ml 2팩 더블 세트 (15% 추가할인)", extraPrice: 22000, stock: 300 }
      ]),
      legalInfo: JSON.stringify({
        productName: "퍼베이드 에코 리필 파우치 1000ml",
        productType: "일반생활화학제품(세정제)",
        manufacturer: "주식회사 퍼베이드",
        origin: "대한민국",
        volume: "1,000ml",
        mainIngredients: "식물유래 계면활성제(코코넛/옥수수 추출물), 정제수, 베이킹소다, 구연산, 천연 에센셜 오일",
        expiryDate: "제조일로부터 36개월 (개봉 후 12개월 권장)",
        cautions: "어린이의 손이 닿지 않는 곳에 보관하십시오. 본품 전용 용기에 리필하여 사용하십시오."
      }),
      stock: 999,
      safetyStock: 30,
      shippingFee: 3000,
      isVisible: true,
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
    console.log('Product ready:', p.name);
  }

  console.log('--- 3. Initializing Policies & Theme ---');
  const policies = [
    { key: 'HERO_TITLE', value: '' },
    { key: 'HERO_SUBTITLE', value: '' },
    { key: 'HERO_BG_TYPE', value: 'IMAGE' },
    { key: 'HERO_BG_URL', value: '/uploads/hero_bg_1786971435418.JPG' },
    { key: 'HERO_VISIBLE', value: 'true' },
    { key: 'HERO_SHOW_TEXT', value: 'false' },
    { key: 'HERO_SHOW_CTA', value: 'true' },
    { key: 'HERO_OVERLAY_OPACITY', value: '0' },
    { key: 'LOGO_URL', value: '/uploads/logo_1786948363468.JPG' },
    { key: 'LOGO_FONT', value: "'Inter', sans-serif" },
    { key: 'THEME_PRIMARY_COLOR', value: '#09090b' },
    { key: 'THEME_ACCENT_COLOR', value: '#d97706' },
    { key: 'THEME_BG_COLOR', value: '#ffffff' },
    { key: 'THEME_BODY_FONT', value: 'Pretendard' },
    { key: 'THEME_HEADING_FONT', value: 'Pretendard' },
    { key: 'THEME_RADIUS', value: '16px' },
    { key: 'WHY_TITLE', value: '왜 퍼베이드인가요?' },
    { key: 'WHY_SUBTITLE', value: '단 하나의 세정제로 경험하는 프리미엄 공간의 변화' },
    { key: 'WHY_CARD1_TITLE', value: '강력한 오염 분해력' },
    { key: 'WHY_CARD1_DESC', value: '주방의 찌든 기름때부터 욕실의 완고한 물때까지 표면 손상 없이 깊숙이 침투하여 즉각 분해합니다.' },
    { key: 'WHY_CARD2_TITLE', value: '안전한 성분 설계' },
    { key: 'WHY_CARD2_DESC', value: '식물 유래 계면활성제와 자연 유래 추출물로 가족 모두가 머무는 공간에 자극 없이 안전합니다.' },
    { key: 'WHY_CARD3_TITLE', value: '지속되는 광택 & 향기' },
    { key: 'WHY_CARD3_DESC', value: '세정 후 끈적임 없는 보호막을 형성하여 오염 재착색을 방지하고 은은한 잔향을 남깁니다.' },
    { key: 'ADMIN_PASSWORD', value: 'pervade_admin_2026!' },
    { key: 'PRODUCT_CATEGORIES', value: JSON.stringify([
      { id: "all_in_one", name: "다목적 세정제", subCategories: ["본품 (스프레이)", "리필 파우치", "세트 상품"] },
      { id: "kitchen", name: "주방 & 다이닝 케어", subCategories: ["기름때 제거제", "식기 & 싱크볼", "인덕션 전용"] },
      { id: "bathroom", name: "욕실 & 리빙 케어", subCategories: ["물때 & 곰팡이", "타일 세정제", "유리 & 거울"] },
      { id: "refill", name: "리필 & 대용량", subCategories: ["에코 파우치 리필", "대용량 벌크"] },
      { id: "accessories", name: "청소 소모품 & 도구", subCategories: ["미세안개 스프레이건", "극세사 타올", "전용 솔"] },
    ])}
  ];

  for (const pol of policies) {
    await prisma.policy.upsert({
      where: { key: pol.key },
      update: { value: pol.value },
      create: pol,
    });
  }
  console.log('Policies ready! Count:', policies.length);

  console.log('--- 4. Initializing Brand Story & Guides ---');
  await prisma.post.upsert({
    where: { id: 'brand-about-main' },
    update: {},
    create: {
      id: 'brand-about-main',
      title: '자연과 공간, 사람을 잇는 지속 가능한 프리미엄 클리닝',
      content: '퍼베이드(PERVADE)는 단순한 세정제를 넘어, 일상 공간의 질서를 바로잡고 삶의 품격을 높이는 라이프스타일 뷰티 솔루션을 제안합니다.\n\n불필요한 화학 성분을 덜어내고 꼭 필요한 순수 자연의 정화력만을 담았습니다. 매일 손닿는 공간에 가장 건강한 깨끗함을 선사합니다.',
      type: 'ABOUT',
      published: true,
      authorId: admin.id,
    }
  });

  console.log('🎉 ALL SEEDING SUCCESSFULLY COMPLETED ON NEW DATABASE!');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
