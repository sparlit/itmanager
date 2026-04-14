export type UserRole = "admin" | "manager" | "staff" | "user" | "guest";

export interface Permission {
  view: string;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { view: "dashboard", create: true, edit: true, delete: true, export: true },
    { view: "tickets", create: true, edit: true, delete: true, export: true },
    { view: "assets", create: true, edit: true, delete: true, export: true },
    { view: "inventory", create: true, edit: true, delete: true, export: true },
    { view: "staff", create: true, edit: true, delete: true, export: true },
    { view: "vendors", create: true, edit: true, delete: true, export: true },
    { view: "licenses", create: true, edit: true, delete: true, export: true },
    { view: "reports", create: true, edit: true, delete: true, export: true },
    { view: "sla-config", create: true, edit: true, delete: true, export: true },
    { view: "audit-log", create: false, edit: false, delete: false, export: true },
    { view: "budgets", create: true, edit: true, delete: true, export: true },
    { view: "backups", create: true, edit: true, delete: true, export: true },
    { view: "notifications", create: true, edit: true, delete: true, export: true },
    { view: "bulk-upload", create: true, edit: false, delete: false, export: true },
    { view: "system-health", create: true, edit: true, delete: true, export: true },
    { view: "user-management", create: true, edit: true, delete: true, export: true },
    { view: "announcements", create: true, edit: true, delete: true, export: true },
    { view: "service-catalog", create: true, edit: true, delete: true, export: true },
    { view: "knowledge-base", create: true, edit: true, delete: true, export: true },
    { view: "calendar", create: true, edit: true, delete: true, export: true },
  ],
  manager: [
    { view: "dashboard", create: true, edit: true, delete: false, export: true },
    { view: "tickets", create: true, edit: true, delete: false, export: true },
    { view: "assets", create: true, edit: true, delete: false, export: true },
    { view: "inventory", create: true, edit: true, delete: false, export: true },
    { view: "staff", create: false, edit: true, delete: false, export: true },
    { view: "vendors", create: true, edit: true, delete: false, export: true },
    { view: "licenses", create: true, edit: true, delete: false, export: true },
    { view: "reports", create: true, edit: false, delete: false, export: true },
    { view: "sla-config", create: true, edit: true, delete: false, export: true },
    { view: "audit-log", create: false, edit: false, delete: false, export: true },
    { view: "budgets", create: true, edit: true, delete: false, export: true },
    { view: "backups", create: false, edit: false, delete: false, export: false },
    { view: "notifications", create: true, edit: true, delete: false, export: true },
    { view: "bulk-upload", create: true, edit: false, delete: false, export: true },
    { view: "system-health", create: false, edit: false, delete: false, export: false },
    { view: "user-management", create: false, edit: false, delete: false, export: false },
    { view: "announcements", create: true, edit: true, delete: false, export: true },
    { view: "service-catalog", create: false, edit: true, delete: false, export: true },
    { view: "knowledge-base", create: true, edit: true, delete: false, export: true },
    { view: "calendar", create: true, edit: true, delete: true, export: true },
  ],
  staff: [
    { view: "dashboard", create: false, edit: false, delete: false, export: false },
    { view: "tickets", create: true, edit: true, delete: false, export: false },
    { view: "assets", create: false, edit: false, delete: false, export: false },
    { view: "inventory", create: false, edit: false, delete: false, export: false },
    { view: "staff", create: false, edit: false, delete: false, export: false },
    { view: "vendors", create: false, edit: false, delete: false, export: false },
    { view: "licenses", create: false, edit: false, delete: false, export: false },
    { view: "reports", create: false, edit: false, delete: false, export: false },
    { view: "sla-config", create: false, edit: false, delete: false, export: false },
    { view: "audit-log", create: false, edit: false, delete: false, export: false },
    { view: "budgets", create: false, edit: false, delete: false, export: false },
    { view: "backups", create: false, edit: false, delete: false, export: false },
    { view: "notifications", create: false, edit: false, delete: false, export: false },
    { view: "bulk-upload", create: false, edit: false, delete: false, export: false },
    { view: "system-health", create: false, edit: false, delete: false, export: false },
    { view: "user-management", create: false, edit: false, delete: false, export: false },
    { view: "announcements", create: false, edit: false, delete: false, export: false },
    { view: "service-catalog", create: true, edit: false, delete: false, export: false },
    { view: "knowledge-base", create: false, edit: false, delete: false, export: false },
    { view: "calendar", create: true, edit: true, delete: true, export: false },
  ],
  user: [
    { view: "dashboard", create: false, edit: false, delete: false, export: false },
    { view: "tickets", create: true, edit: false, delete: false, export: false },
    { view: "assets", create: false, edit: false, delete: false, export: false },
    { view: "inventory", create: false, edit: false, delete: false, export: false },
    { view: "staff", create: false, edit: false, delete: false, export: false },
    { view: "vendors", create: false, edit: false, delete: false, export: false },
    { view: "licenses", create: false, edit: false, delete: false, export: false },
    { view: "reports", create: false, edit: false, delete: false, export: false },
    { view: "sla-config", create: false, edit: false, delete: false, export: false },
    { view: "audit-log", create: false, edit: false, delete: false, export: false },
    { view: "budgets", create: false, edit: false, delete: false, export: false },
    { view: "backups", create: false, edit: false, delete: false, export: false },
    { view: "notifications", create: false, edit: false, delete: false, export: false },
    { view: "bulk-upload", create: false, edit: false, delete: false, export: false },
    { view: "system-health", create: false, edit: false, delete: false, export: false },
    { view: "user-management", create: false, edit: false, delete: false, export: false },
    { view: "announcements", create: false, edit: false, delete: false, export: false },
    { view: "service-catalog", create: true, edit: false, delete: false, export: false },
    { view: "knowledge-base", create: false, edit: false, delete: false, export: false },
    { view: "calendar", create: false, edit: false, delete: false, export: false },
  ],
  guest: [
    { view: "dashboard", create: false, edit: false, delete: false, export: false },
    { view: "tickets", create: false, edit: false, delete: false, export: false },
    { view: "knowledge-base", create: false, edit: false, delete: false, export: false },
    { view: "service-catalog", create: false, edit: false, delete: false, export: false },
  ],
};

export function hasPermission(role: UserRole, view: string, action: "create" | "edit" | "delete" | "export"): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  
  const permission = permissions.find(p => p.view === view);
  if (!permission) return false;
  
  return permission[action] === true;
}

export function canAccess(role: UserRole, view: string): boolean {
  // Admin has access to everything
  if (role === "admin") return true;
  
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  
  return permissions.some(p => p.view === view);
}

export function getNavItemsForRole(role: UserRole): string[] {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return [];
  
  return permissions.filter(p => p.create || p.edit || p.delete || p.view === "dashboard").map(p => p.view);
}
