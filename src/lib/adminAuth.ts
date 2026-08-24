import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type AdminPermission = "PRODUCTS" | "USERS" | "CONTENTS" | "POLICIES";

export interface AdminAuthInfo {
  id: string;
  name: string;
  email: string;
  loginId: string | null;
  role: string;
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
}

export function parseAdminPermissions(user: { loginId?: string | null; role: string }): {
  isSuperAdmin: boolean;
  permissions: AdminPermission[];
} {
  if (!user || !user.role) {
    return { isSuperAdmin: false, permissions: [] };
  }

  // Super Admin (admin ID or SUPER_ADMIN or standard ADMIN without restricted manager flags)
  if (user.loginId === "admin" || user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
    return {
      isSuperAdmin: true,
      permissions: ["PRODUCTS", "USERS", "CONTENTS", "POLICIES"],
    };
  }

  // Sub-admin with specific granular permissions (e.g. "MANAGER:PRODUCTS,USERS")
  if (user.role.startsWith("MANAGER")) {
    const parts = user.role.split(":");
    const permList = (parts[1] ? parts[1].split(",") : []) as AdminPermission[];
    return {
      isSuperAdmin: false,
      permissions: permList,
    };
  }

  return {
    isSuperAdmin: false,
    permissions: [],
  };
}

export function hasPermission(
  adminInfo: { isSuperAdmin: boolean; permissions: AdminPermission[] },
  module: AdminPermission
): boolean {
  if (!adminInfo) return false;
  if (adminInfo.isSuperAdmin) return true;
  return adminInfo.permissions.includes(module);
}

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
      admin = await prisma.user.create({
        data: {
          loginId: "admin",
          email: "admin@pervade.co.kr",
          name: "최고관리자",
          role: "SUPER_ADMIN",
          passwordHash: "$2b$10$admin123456hash",
          referralCode: "admin_master_code",
          realNameVerified: true,
          phone: "010-0000-0000",
          address: "서울특별시 강남구 테헤란로 123",
        }
      });
    } else if (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN") {
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: {
          loginId: "admin",
          role: "SUPER_ADMIN"
        }
      });
    }
    return admin;
  } catch (err) {
    console.error("ensureDefaultAdminExists error:", err);
    return null;
  }
}
