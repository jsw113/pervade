const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_zJSsy0OTRh7Y@ep-blue-smoke-au8vfowl.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

async function check() {
  const users = await prisma.user.findMany();
  console.log('All Users in DB:');
  users.forEach(u => {
    console.log({
      id: u.id,
      email: u.email,
      loginId: u.loginId,
      name: u.name,
      role: u.role,
      passwordHash: u.passwordHash?.slice(0, 30) + '...'
    });
  });
  await prisma.$disconnect();
}
check();
