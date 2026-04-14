"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { TicketsView } from "@/components/tickets/tickets-view";
import { AssetsView } from "@/components/assets/assets-view";
import { InventoryView } from "@/components/inventory/inventory-view";
import { StaffView } from "@/components/staff/staff-view";
import { VendorsView } from "@/components/vendors/vendors-view";
import { LicensesView } from "@/components/licenses/licenses-view";
import { ReportsView } from "@/components/reports/reports-view";
import { AnnouncementsView } from "@/components/announcements/announcements-view";
import { NotificationsView } from "@/components/notifications/notifications-view";
import { BudgetsView } from "@/components/budgets/budgets-view";
import { BackupsView } from "@/components/backups/backups-view";
import { SLAConfigView } from "@/components/sla-config/sla-config-view";
import { AuditLogView } from "@/components/audit-log/audit-log-view";
import { ServiceCatalogView } from "@/components/service-catalog/service-catalog-view";
import { KnowledgeBaseView } from "@/components/knowledge-base/knowledge-base-view";
import { CalendarView } from "@/components/calendar/calendar-view";
import { UserManagementView } from "@/components/users/user-management-view";
import { PreferencesView } from "@/components/preferences/preferences-view";
import { ProfileSettingsView } from "@/components/profile/profile-settings-view";
import { HelpCenterView } from "@/components/help/help-center-view";
import { BulkUploadView } from "@/components/bulk-upload/bulk-upload-view";
import { SystemHealthView } from "@/components/system-health/system-health-view";

const viewComponents: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  tickets: TicketsView,
  assets: AssetsView,
  inventory: InventoryView,
  staff: StaffView,
  vendors: VendorsView,
  licenses: LicensesView,
  reports: ReportsView,
  announcements: AnnouncementsView,
  notifications: NotificationsView,
  budgets: BudgetsView,
  backups: BackupsView,
  "sla-config": SLAConfigView,
  "audit-log": AuditLogView,
  "service-catalog": ServiceCatalogView,
  "knowledge-base": KnowledgeBaseView,
  calendar: CalendarView,
  "user-management": UserManagementView,
  preferences: PreferencesView,
  "profile-settings": ProfileSettingsView,
  "help-center": HelpCenterView,
  "bulk-upload": BulkUploadView,
  "system-health": SystemHealthView,
};

export default function ITPortalPage() {
  const router = useRouter();
  const { user, setUser, currentView } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser({
              userId: data.user.id,
              username: data.user.username,
              name: data.user.name,
              role: data.user.role,
              email: data.user.email || "",
            });
          }
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router, setUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const ViewComponent = viewComponents[currentView] || DashboardView;

  return (
    <div className="min-h-screen bg-slate-950">
      <AppSidebar />
      <div className="lg:pl-72">
        <AppHeader />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <ViewComponent />
        </main>
      </div>
    </div>
  );
}
