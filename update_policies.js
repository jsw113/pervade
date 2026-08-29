const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_zJSsy0OTRh7Y@ep-blue-smoke-au8vfowl.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function update() {
  await prisma.policy.upsert({
    where: { key: 'HERO_BG_URL' },
    update: { value: '/uploads/hero_bg_1786971398395.JPG' },
    create: { key: 'HERO_BG_URL', value: '/uploads/hero_bg_1786971398395.JPG' }
  });
  console.log('✅ Updated HERO_BG_URL to Banner B (/uploads/hero_bg_1786971398395.JPG)');

  await prisma.policy.upsert({
    where: { key: 'LOGO_URL' },
    update: { value: '/uploads/logo_1786948363468.JPG' },
    create: { key: 'LOGO_URL', value: '/uploads/logo_1786948363468.JPG' }
  });
  console.log('✅ Updated LOGO_URL to /uploads/logo_1786948363468.JPG');

  await prisma.$disconnect();
}
update();
