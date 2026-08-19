const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find an admin user to assign as author
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: "admin@pervade.com",
        name: "관리자",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuv", // dummy hash
        role: "ADMIN"
      }
    });
  }

  // Seed About Post
  await prisma.post.upsert({
    where: { id: "about-story" },
    update: {},
    create: {
      id: "about-story",
      title: "퍼베이드가 만들어가는 새로운 일상의 기준",
      content: `우리는 매일 피부에 닿고 마시는 공기, 머무는 공간의 청결함을 고민합니다.
퍼베이드는 이러한 일상의 가장 기본이 되는 '청소'에서부터 삶의 질을 높이기 위한 고민을 시작했습니다.

단순히 먼지를 털어내고 때를 벗겨내는 것을 넘어,
자연 유래 유효 성분을 바탕으로 안전하면서도 가장 완벽한 세정 솔루션을 선사합니다.

우리의 핵심 가치:
1. 가족의 안전을 위한 자연유래 안심 처방
2. 물 한 방울 남기지 않는 혁신적인 논-린스(Non-rinse) 공법
3. 공간에 인테리어 오브제가 되는 미니멀하고 감각적인 패키지 디자인

퍼베이드와 함께, 귀찮고 힘들었던 청소 시간을 매일 기다려지는 기분 좋은 리추얼로 바꿔보세요.`,
      type: "ABOUT",
      published: true,
      authorId: admin.id
    }
  });

  // Seed Journal Post
  await prisma.post.upsert({
    where: { id: "journal-clean-home" },
    update: {},
    create: {
      id: "journal-clean-home",
      title: "쾌적한 재택근무 환경을 위한 5분 데스크 청소 팁",
      content: `집에서 일하는 시간이 늘어남에 따라, 업무 공간인 '데스크'의 청결이 집중도와 기분에 미치는 영향은 더욱 커졌습니다.
키보드 틈새의 먼지부터 머그컵 자국까지, 단 5분 투자로 업무 효율을 200% 끌어올릴 수 있는 가벼운 데스크 리추얼을 소개합니다.

1. 전자기기 액정과 모니터 닦기
모니터의 미세한 먼지와 손때는 눈의 피로를 유발합니다. 극세사 천에 세정제를 살짝 분사하여 가볍게 쓸어내리듯 닦아주세요.

2. 키보드와 마우스 소독
매일 손이 닿는 키보드와 마우스는 의외로 세균 번식이 활발한 곳입니다. 물기를 살짝 머금은 천으로 미세한 틈새를 닦아 청결을 유지하세요.

3. 커피 자국과 다이어리 주변 정돈
책상 위의 얼룩은 시각적인 스트레스를 줍니다. 가벼운 다목적 세정 스프레이로 한 번만 훔쳐내도 상쾌한 향과 함께 책상이 새것처럼 반짝입니다.

지금 책상을 한번 정리해보는 것은 어떨까요? 작은 습관이 매일의 집중력을 바꿉니다.`,
      type: "JOURNAL",
      published: true,
      authorId: admin.id
    }
  });

  console.log("About & Journal Posts Seeded");
}

main().catch(console.error).finally(() => prisma.$disconnect());
