"use client";

import { useAppStore } from "@/store/app-store";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import dynamic from "next/dynamic";

const DashboardView = dynamic(() => import("@/components/dashboard/dashboard-view").then(m => ({ default: m.DashboardView })), { ssr: false });
const TicketsView = dynamic(() => import("@/components/tickets/tickets-view").then(m => ({ default: m.TicketsView })), { ssr: false });
const TicketDetail = dynamic(() => import("@/components/tickets/ticket-detail").then(m => ({ default: m.TicketDetail })), { ssr: false });
const AssetsView = dynamic(() => import("@/components/assets/assets-view").then(m => ({ default: m.AssetsView })), { ssr: false });
const AssetDetail = dynamic(() => import("@/components/assets/asset-detail").then(m => ({ default: m.AssetDetail })), { ssr: false });
const InventoryView = dynamic(() => import("@/components/inventory/inventory-view").then(m => ({ default: m.InventoryView })), { ssr: false });
const InventoryDetail = dynamic(() => import("@/components/inventory/inventory-detail").then(m => ({ default: m.InventoryDetail })), { ssr: false });
const StaffView = dynamic(() => import("@/components/staff/staff-view").then(m => ({ default: m.StaffView })), { ssr: false });
const StaffDetail = dynamic(() => import("@/components/staff/staff-detail").then(m => ({ default: m.StaffDetail })), { ssr: false });
const ReportsView = dynamic(() => import("@/components/reports/reports-view").then(m => ({ default: m.ReportsView })), { ssr: false });
const VendorsView = dynamic(() => import("@/components/vendors/vendors-view").then(m => ({ default: m.VendorsView })), { ssr: false });
const VendorDetail = dynamic(() => import("@/components/vendors/vendor-detail").then(m => ({ default: m.VendorDetail })), { ssr: false });
const KnowledgeBaseView = dynamic(() => import("@/components/knowledge-base/knowledge-base-view").then(m => ({ default: m.KnowledgeBaseView })), { ssr: false });
const KnowledgeBaseDetail = dynamic(() => import("@/components/knowledge-base/knowledge-base-detail").then(m => ({ default: m.KnowledgeBaseDetail })), { ssr: false });
const CalendarView = dynamic(() => import("@/components/calendar/calendar-view").then(m => ({ default: m.CalendarView })), { ssr: false });

// New enhanced modules
const LicensesView = dynamic(() => import("@/components/licenses/licenses-view").then(m => ({ default: m.LicensesView })), { ssr: false });
const LicenseDetail = dynamic(() => import("@/components/licenses/license-detail").then(m => ({ default: m.LicenseDetail })), { ssr: false });
const ChangesView = dynamic(() => import("@/components/changes/changes-view").then(m => ({ default: m.ChangesView })), { ssr: false });
const ChangeDetail = dynamic(() => import("@/components/changes/change-detail").then(m => ({ default: m.ChangeDetail })), { ssr: false });
const TimeTrackingView = dynamic(() => import("@/components/time-tracking/time-tracking-view").then(m => ({ default: m.TimeTrackingView })), { ssr: false });
const AuditLogView = dynamic(() => import("@/components/audit-log/audit-log-view").then(m => ({ default: m.AuditLogView })), { ssr: false });
const SLAConfigView = dynamic(() => import("@/components/sla-config/sla-config-view").then(m => ({ default: m.SLAConfigView })), { ssr: false });
const ServiceCatalogView = dynamic(() => import("@/components/service-catalog/service-catalog-view").then(m => ({ default: m.ServiceCatalogView })), { ssr: false });
const BudgetsView = dynamic(() => import("@/components/budgets/budgets-view").then(m => ({ default: m.BudgetsView })), { ssr: false });
const BackupsView = dynamic(() => import("@/components/backups/backups-view").then(m => ({ default: m.BackupsView })), { ssr: false });
const NotificationsView = dynamic(() => import("@/components/notifications/notifications-view").then(m => ({ default: m.NotificationsView })), { ssr: false });
const BulkUploadView = dynamic(() => import("@/components/bulk-upload/bulk-upload-view").then(m => ({ default: m.BulkUploadView })), { ssr: false });
const SystemHealthView = dynamic(() => import("@/components/system-health/system-health-view").then(m => ({ default: m.SystemHealthView })), { ssr: false });

export default function Home() {
  const { currentView, sidebarOpen, setSidebarOpen } = useAppStore();

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1024 && sidebarOpen) setSidebarOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  const renderView = () => {
    switch (currentView) {
      case "dashboard": return <DashboardView />;
      case "tickets": return <TicketsView />;
      case "ticket-detail": return <TicketDetail />;
      case "assets": return <AssetsView />;
      case "asset-detail": return <AssetDetail />;
      case "inventory": return <InventoryView />;
      case "inventory-detail": return <InventoryDetail />;
      case "staff": return <StaffView />;
      case "staff-detail": return <StaffDetail />;
      case "vendors": return <VendorsView />;
      case "vendor-detail": return <VendorDetail />;
      case "knowledge-base": return <KnowledgeBaseView />;
      case "knowledge-base-detail": return <KnowledgeBaseDetail />;
      case "calendar": return <CalendarView />;
      case "reports": return <ReportsView />;
      case "licenses": return <LicensesView />;
      case "license-detail": return <LicenseDetail />;
      case "changes": return <ChangesView />;
      case "change-detail": return <ChangeDetail />;
      case "time-tracking": return <TimeTrackingView />;
      case "audit-log": return <AuditLogView />;
      case "sla-config": return <SLAConfigView />;
      case "service-catalog": return <ServiceCatalogView />;
      case "budgets": return <BudgetsView />;
      case "backups": return <BackupsView />;
      case "notifications": return <NotificationsView />;
      case "bulk-upload": return <BulkUploadView />;
      case "system-health": return <SystemHealthView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}
      <AppSidebar />
      <div className={cn("flex min-h-screen flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]", "lg:ml-[68px]", sidebarOpen ? "lg:ml-[260px]" : "")}>
        <AppHeader />
        <ErrorBoundary>
          <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">{renderView()}</main>
        </ErrorBoundary>
        <footer className="border-t border-border bg-card/60 backdrop-blur-sm mt-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600">
                <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-foreground">IT Manager</span>
                <span className="text-[12px] text-border hidden sm:inline">|</span>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">v4.0.0</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-muted-foreground hidden md:block">Next.js 16 &bull; TypeScript &bull; Tailwind CSS &bull; Prisma</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30 pulse-dot" />
                <span className="text-[11px] text-muted-foreground font-medium">All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
