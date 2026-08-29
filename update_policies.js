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
    where: { key: 'LOGO_URL' },
    update: { value: '' },
    create: { key: 'LOGO_URL', value: '' }
  });
  console.log('✅ Updated LOGO_URL to empty string (clean typography logo)');

  await prisma.$disconnect();
}
update();
