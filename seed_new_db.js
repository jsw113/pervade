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
  const posts = [
    {
      id: "brand-story-default",
      title: "자연과 공간, 사람을 잇는 지속 가능한 클리닝",
      type: "ABOUT",
      published: true,
      authorId: admin.id,
      content: `퍼베이드(PERVADE)는 단순한 세정제를 넘어, 일상 공간의 질서를 바로잡고 삶의 품격을 높이는 라이프스타일 뷰티 솔루션을 제안합니다.

불필요한 화학 성분을 덜어내고 꼭 필요한 순수 자연의 정화력만을 담았습니다. 매일 손닿는 공간에 가장 건강한 깨끗함을 선사합니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
◆ PERVADE의 4대 안심 원칙 (Our Core Philosophy)

1. 자연 유래 계면활성제의 순수 정화력
코코넛과 팜에서 추출한 식물성 계면활성제를 사용하여 표면 손상 없이 깊숙이 침투, 오염 물질의 결합만을 스마트하게 분해합니다.

2. 피부 저자극 0.00 무자극 판정
피부 임상 테스트 결과 자극 지수 0.00%의 무자극 판정을 획득하여, 고무장갑 없이도 온 가족이 머무는 공간을 안심하고 닦아낼 수 있습니다.

3. 유해 의심 물질 12종 불검출 안심 처방
파라벤, 형광증백제, 인공색소, 가습기 살균제 성분(CMIT/MIT) 등 유해 우려 성분을 철저히 배제하였습니다.

4. 100% 생분해성 포뮬러와 친환경 패키징
사용 후 자연으로 돌아가는 친환경 생분해 포뮬러와 재활용 가능한 패키지를 적용하여 지속 가능한 환경을 지켜나갑니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

공간이 맑아질 때 삶의 호흡도 깊어집니다. 
퍼베이드와 함께 매일의 공간을 더 안전하고 아름답게 가꿔보세요.`
    },
    {
      id: "minimal-cleaning-solution",
      title: "미니멀 라이프를 위한 단 하나의 세정 솔루션",
      type: "JOURNAL",
      published: true,
      authorId: admin.id,
      imageUrl: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?q=80&w=1200&auto=format&fit=crop",
      content: `수납장에 가득 찬 수많은 전용 세정제들, 과연 그 모든 병들이 다 필요할까요?

퍼베이드(PERVADE)는 '하나로 완성되는 가장 완벽한 청소'를 지향합니다.
주방의 찌든 기름때, 인덕션 상판, 욕실의 완고한 물때, 가구와 거실 바닥까지.

■ 하나로 끝내는 스마트 멀티 케어 루틴:
1. 주방: 기름때가 튄 인덕션과 싱크대 상판에 가볍게 분무 후 30초 뒤 마른 천으로 닦아냅니다.
2. 욕실: 세면대와 수전의 물때, 거울 얼룩에 분무 후 헹궈내면 물방울 맺힘 방지 코팅이 형성됩니다.
3. 리빙: 원목 가구, 식탁, 가전제품 표면의 지문과 생활 먼지를 잔여감 없이 깔끔하게 제거합니다.

표면을 손상시키지 않고 오염의 결합만을 부드럽게 분해하는 스마트 포뮬러로 수납장을 가볍게 비우고, 미니멀하고 감각적인 라이프스타일을 완성해 보세요.`
    },
    {
      id: "safe-ingredients-choice",
      title: "가족의 숨결이 닿는 공간, 안전한 성분의 선택",
      type: "JOURNAL",
      published: true,
      authorId: admin.id,
      imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      content: `매일 손이 닿는 식탁, 아이들이 뒹구는 바닥, 반려동물이 호기심에 냄새를 맡는 가구 표면.

청소 후 공기 중에 남는 냄새와 잔여물은 가족의 호흡기와 피부에 직접 닿습니다.
그렇기 때문에 세정제의 성분은 화장품만큼이나 꼼꼼하고 엄격하게 선택되어야 합니다.

■ 퍼베이드의 안심 성분 기준:
· 식물 유래 코코넛 계면활성제로 부드럽고 강력한 세정력
· 공인 시험기관 피부 저자극 테스트 완료 (무자극 지수 0.00)
· 호흡기를 자극하는 독한 염소계 락스 성분 0%
· 은은하게 맴도는 자연 유래 시트러스 블렌딩 잔향

이제 청소할 때 마스크나 장갑을 찾지 않아도 됩니다. 가족 모두가 안심하고 숨 쉴 수 있는 맑고 건강한 공간을 선물하세요.`
    },
    {
      id: "scent-and-living-space",
      title: "머무는 자리에 남는 은은한 감각, 공간 향과 잔향의 미학",
      type: "JOURNAL",
      published: true,
      authorId: admin.id,
      imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop",
      content: `깨끗하게 정돈된 공간에 문을 열고 들어섰을 때 느껴지는 첫인상, 바로 '공간의 향기'입니다.

기존 세정제의 화학적이고 역한 냄새는 청소를 꺼리게 만드는 주원인이었습니다.
퍼베이드는 전문 조향사와 협업하여, 청소 중에는 상쾌한 아로마 테라피를, 청소 후에는 호텔 라운지에 머무는 듯한 은은한 여운을 남기도록 설계되었습니다.

■ 공간별 향기 연출 팁:
· 현관 및 거실: 가벼운 분무 후 마른 극세사 타월로 닦아내면 정전기 방지와 함께 외출 후 돌아왔을 때 편안한 허브향이 맞이합니다.
· 주방 및 다이닝: 음식 냄새가 밴 식탁과 조리대 주변을 정돈하여 잡내를 잡고 산뜻한 그리너리 무드를 연출합니다.

시각적인 깨끗함을 넘어, 후각과 감각까지 채워주는 완벽한 공간 케어를 경험해 보세요.`
    },
    {
      id: "news-01",
      title: "퍼베이드 공식 온라인 플래그십 스토어 오픈 안내",
      type: "NOTICE",
      published: true,
      authorId: admin.id,
      imageUrl: "https://images.unsplash.com/photo-1608248597359-5936735e00b6?q=80&w=1200&auto=format&fit=crop",
      content: `퍼베이드(PERVADE) 공식 온라인 플래그십 스토어가 정식 오픈하였습니다.

공간을 비우고 본질을 채우는 퍼베이드만의 시그니처 프리미엄 클리닝 라인업을 가장 먼저 만나보실 수 있습니다.

■ 공식 플래그십 혜택:
· 신규 회원 가입 즉시 10% 웰컴 쿠폰 지급
· 전 제품 무료 배송 프로모션 진행
· 정기 구독 및 에코 리필 팩 구매 시 추가 마일리지 적립

앞으로 다양한 에디토리얼 저널과 공간 케어 솔루션으로 찾아뵙겠습니다. 많은 관심과 사랑 부탁드립니다.`
    },
    {
      id: "news-02",
      title: "대용량 1,000ml 친환경 에코 리필 파우치 정식 출시",
      type: "NOTICE",
      published: true,
      authorId: admin.id,
      imageUrl: "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?q=80&w=1200&auto=format&fit=crop",
      content: `플라스틱 사용량을 70% 줄이고 공간의 미니멀리즘을 유지하는 퍼베이드의 순환 프로젝트, 1,000ml 대용량 에코 리필 파우치가 출시되었습니다.

기존 500ml 본품 보틀에 2회 가득 채워 사용할 수 있는 경제적이고 친환경적인 선택입니다.

■ 에코 리필 파우치 특장점:
· 플라스틱 배출량 70% 감소
· 안전 캡 스파우트로 잔여물 없이 깔끔한 리필 가능
· 본품 대비 20% 절약된 경제적인 용량과 가격

지속 가능한 라이프스타일을 퍼베이드와 함께 시작해보세요.`
    },
    {
      id: "news-03",
      title: "신규 가입 회원 대상 첫 구매 10% 웰컴 쿠폰 혜택",
      type: "NOTICE",
      published: true,
      authorId: admin.id,
      imageUrl: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop",
      content: `퍼베이드에 첫 발을 내딛는 고객님들을 위해 특별한 혜택을 준비했습니다.

신규 회원 가입을 완료하신 모든 분들께 첫 구매 시 즉시 사용 가능한 10% 할인 쿠폰을 증정합니다.

■ 이벤트 안내:
· 대상: 신규 회원 가입 고객 전원
· 혜택: 전 품목 적용 가능한 10% 할인 쿠폰 (마이페이지 자동 발급)
· 기간: 상시 진행

지금 회원가입하시고 프리미엄 공간 케어의 시작을 함께해보세요.`
    },
    {
      id: "guide-kitchen",
      title: "기름때와 오염 없는 쾌적한 주방 & 인덕션 케어 루틴",
      type: "GUIDE",
      published: true,
      authorId: admin.id,
      imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop",
      content: `기름때와 조리 찌꺼기가 쌓이기 쉬운 주방을 언제나 새것처럼 맑고 위생적으로 관리하는 전문가 가이드입니다.

■ 3단계 주방 케어법:
1. 조리 직후 열기가 가라앉은 인덕션 및 가스레인지에 분무
2. 30초 후 기름때가 유화되면 전용 극세사 타월로 1회 닦아내기
3. 싱크대 수전과 배수구 주변에 가볍게 뿌려 냄새와 물때 동시 예방`
    },
    {
      id: "guide-bathroom",
      title: "물때와 곰팡이 걱정 없는 호텔식 욕실 건식 케어",
      type: "GUIDE",
      published: true,
      authorId: admin.id,
      imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop",
      content: `샤워 후 남는 석회질 물때와 타일 틈새 오염을 손쉽게 제거하고 호텔처럼 뽀송한 상태를 유지하는 방법입니다.

■ 욕실 데일리 케어법:
1. 샤워 부스 유리와 수전에 물기가 마르기 전 퍼베이드 분무
2. 스퀴지(유리닦이)로 위에서 아래로 가볍게 쓸어내리기
3. 표면에 자연 코팅막이 형성되어 물방울이 맺히지 않고 흘러내립니다.`
    },
    {
      id: "guide-living",
      title: "원목 가구와 패브릭, 생활 가전의 지문·먼지 정전기 방지 케어",
      type: "GUIDE",
      published: true,
      authorId: admin.id,
      imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
      content: `고급 원목 식탁, 가전제품 디스플레이, 거실 테이블의 지문과 미세먼지를 자극 없이 닦아내는 방법입니다.

■ 리빙 케어 팁:
1. 가구에 직접 뿌리지 않고 부드러운 극세사 타월에 1~2회 분무
2. 결을 따라 가볍게 닦아주면 정전기 방지 효과로 먼지가 쉽게 달라붙지 않습니다.`
    }
  ];

  for (const p of posts) {
    await prisma.post.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
    console.log('Post ready:', p.title);
  }

  console.log('🎉 ALL SEEDING SUCCESSFULLY COMPLETED ON NEW DATABASE!');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
