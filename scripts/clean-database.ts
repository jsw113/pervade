import { prisma } from "../src/lib/prisma";
import { ensureDefaultAdminExists } from "../src/lib/adminAuth";

async function main() {
  console.log("🧹 Initializing clean database setup (Super Admin only)...");

  // 1. Ensure Super Admin user exists
  const superAdmin = await ensureDefaultAdminExists();
  console.log(`✅ Super Admin confirmed: ${superAdmin?.loginId || "admin"}`);

  // 2. Clear customer transactional and personal data
  console.log("🗑️ Clearing orders, cart items, coupons, and customer logs...");
  await prisma.cartItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.userCoupon.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.messageLog.deleteMany({});
  await prisma.siteLog.deleteMany({});
  await prisma.channelOrder.deleteMany({});
  await prisma.inventoryLog.deleteMany({});

  // 3. Clear regular non-admin users
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      role: { notIn: ["SUPER_ADMIN", "ADMIN"] },
      loginId: { not: "admin" },
      email: { not: "admin@pervade.co.kr" },
    },
  });
  console.log(`✅ Cleared ${deletedUsers.count} regular customer account(s).`);

  console.log("\n🎉 Database cleanup complete! Clean template is ready.");
}

main()
  .catch((e) => {
    console.error("❌ Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
