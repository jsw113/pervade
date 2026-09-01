const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_zJSsy0OTRh7Y@ep-blue-smoke-au8vfowl.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function seed() {
  const policies = [
    { key: 'TOSS_PAYMENT_ENABLED', value: 'true' },
    { key: 'TOSS_PG_MODE', value: 'TEST' },
    { key: 'TOSS_CLIENT_KEY', value: 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm' },
    { key: 'TOSS_SECRET_KEY', value: 'test_gsk_docs_OaPzBL5KdmQXkzRz3y47BMW6' },
    { key: 'TOSS_MID', value: '개발 연동 체험 상점' }
  ];
  for (const p of policies) {
    await prisma.policy.upsert({
      where: { key: p.key },
      update: { value: p.value },
      create: { key: p.key, value: p.value }
    });
    console.log('Upserted:', p.key);
  }
  await prisma.$disconnect();
}
seed();
