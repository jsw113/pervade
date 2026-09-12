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

export async function getAdminUser(request?: Request): Promise<AdminAuthInfo | null> {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get("userId")?.value;

    if (!userId && request) {
      userId = request.headers.get("x-user-id") || undefined;
    }

    let user: any = null;

    if (userId) {
      user = await prisma.user.findFirst({
        where: { id: userId },
      });
    }

    // If no user found by cookie (e.g. fresh DB seed or stale cookie), check if default super admin exists
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { role: "SUPER_ADMIN" },
            { role: "ADMIN" },
            { loginId: "admin" },
            { email: "admin@pervade.co.kr" }
          ]
        },
        orderBy: { createdAt: "asc" }
      });
    }

    if (!user) return null;

    // Check if role is admin or manager or master admin
    if (user.loginId !== "admin" && user.email !== "admin@pervade.co.kr" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN" && !user.role?.startsWith("MANAGER")) {
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

import { hashPassword } from "@/lib/authCrypto";

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

    const defaultInitialPass = process.env.ADMIN_PASSWORD || "pervade_admin_2026!";

    if (!admin) {
      // Create master super admin account
      admin = await prisma.user.create({
        data: {
          loginId: "admin",
          name: "최고관리자 (Super Admin)",
          email: "admin@pervade.co.kr",
          passwordHash: hashPassword(defaultInitialPass),
          role: "SUPER_ADMIN",
          phone: "010-0000-0000",
          realNameVerified: true,
        }
      });
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
