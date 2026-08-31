const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_zJSsy0OTRh7Y@ep-blue-smoke-au8vfowl.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function save() {
  await prisma.policy.upsert({
    where: { key: 'GOOGLE_SITE_VERIFICATION' },
    update: { value: '2hopz_VI0amSopbjK2ngbWeXA3lJ-OzXpVlOVZPtGCw' },
    create: { key: 'GOOGLE_SITE_VERIFICATION', value: '2hopz_VI0amSopbjK2ngbWeXA3lJ-OzXpVlOVZPtGCw' }
  });
  console.log('✅ GOOGLE_SITE_VERIFICATION policy saved to database!');
  await prisma.$disconnect();
}
save();
