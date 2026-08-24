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
