import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { 
  AdminPermission, 
  AdminAuthInfo, 
  parseAdminPermissions, 
  hasPermission 
} from "@/lib/adminPermissions";

export { 
  type AdminPermission, 
  type AdminAuthInfo, 
  parseAdminPermissions, 
  hasPermission 
};

export async function getAdminUser(): Promise<AdminAuthInfo | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return null;

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) return null;

    // Check if role is admin or manager
    if (user.loginId !== "admin" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && !user.role.startsWith("MANAGER")) {
      return null;
    }

    const { isSuperAdmin, permissions } = parseAdminPermissions(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      loginId: user.loginId,
      role: user.role,
      isSuperAdmin,
      permissions,
    };
  } catch (err) {
    console.error("getAdminUser error:", err);
    return null;
  }
}

export async function ensureDefaultAdminExists() {
  try {
    let admin = await prisma.user.findFirst({
      where: {
        OR: [
          { loginId: "admin" },
          { email: "admin@pervade.co.kr" }
        ]
      }
    });

    if (!admin) {
      // Create master super admin account
      admin = await prisma.user.create({
        data: {
          loginId: "admin",
          name: "최고관리자 (Super Admin)",
          email: "admin@pervade.co.kr",
          passwordHash: "$2b$10$ep0v0J/xP1pL/r9mP1cKLe123456mockhash",
          role: "SUPER_ADMIN",
          phone: "010-0000-0000",
          realNameVerified: true,
        }
      });
      console.log("Master Super Admin account created automatically: admin / 123456");
    } else if (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN") {
      // Upgrade role to SUPER_ADMIN
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: { role: "SUPER_ADMIN" }
      });
    }

    return admin;
  } catch (e) {
    console.error("Failed to seed default admin:", e);
    return null;
  }
}
