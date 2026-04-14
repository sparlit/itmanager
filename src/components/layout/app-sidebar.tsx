"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard,
  Ticket,
  Package,
  Warehouse,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Shield,
  BookOpen,
  Building2,
  CalendarDays,
  KeyRound,
  GitBranch,
  Clock,
  FileSearch,
  Settings,
  ShoppingBag,
  Wallet,
  Database,
  Bell,
  Activity,
  Pin,
  PinOff,
  MessageSquare,
  User,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { canAccess } from "@/lib/permissions";

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard, description: "Overview & analytics" },
  { id: "tickets" as const, label: "Tickets", icon: Ticket, description: "Support & issues" },
  { id: "assets" as const, label: "Assets", icon: Package, description: "Hardware & software" },
  { id: "inventory" as const, label: "Inventory", icon: Warehouse, description: "Stock management" },
  { id: "licenses" as const, label: "Licenses", icon: KeyRound, description: "Software licenses" },
  { id: "vendors" as const, label: "Vendors", icon: Building2, description: "Suppliers & contracts" },
  { id: "staff" as const, label: "Team", icon: Users, description: "People & roles" },
];

const navItemsSecondary = [
  { id: "service-catalog" as const, label: "Services", icon: ShoppingBag, description: "Service catalog" },
  { id: "knowledge-base" as const, label: "Knowledge Base", icon: BookOpen, description: "Articles & guides" },
  { id: "calendar" as const, label: "Calendar", icon: CalendarDays, description: "Schedule & events" },
  { id: "chat-support" as const, label: "Chat Support", icon: MessageSquare, description: "Live chat assistance" },
];

const navItemsUser = [
  { id: "profile-settings" as const, label: "Profile", icon: User, description: "User profile settings" },
  { id: "preferences" as const, label: "Preferences", icon: Settings, description: "App preferences" },
  { id: "help-center" as const, label: "Help Center", icon: HelpCircle, description: "Help & support" },
];

const navItemsAdmin = [
  { id: "reports" as const, label: "Reports", icon: BarChart3, description: "Insights & data" },
  { id: "announcements" as const, label: "Announcements", icon: Bell, description: "System announcements" },
  { id: "sla-config" as const, label: "SLA Policies", icon: Settings, description: "SLA configuration" },
  { id: "audit-log" as const, label: "Audit Log", icon: FileSearch, description: "System activity" },
  { id: "budgets" as const, label: "Budgets", icon: Wallet, description: "Financial tracking" },
  { id: "backups" as const, label: "Backups", icon: Database, description: "Backup management" },
  { id: "notifications" as const, label: "Notifications", icon: Bell, description: "Alerts & updates" },
  { id: "bulk-upload" as const, label: "Bulk Upload", icon: Database, description: "Import CSV data" },
  { id: "system-health" as const, label: "System Health", icon: Activity, description: "Monitoring & alerts" },
  { id: "user-management" as const, label: "User Management", icon: Users, description: "Access control" },
];

const allNavItems = [...navItems, ...navItemsSecondary, ...navItemsUser, ...navItemsAdmin];

const detailViews: Record<string, string> = {
  "ticket-detail": "tickets",
  "asset-detail": "assets",
  "inventory-detail": "inventory",
  "staff-detail": "staff",
  "vendor-detail": "vendors",
  "knowledge-base-detail": "knowledge-base",
  "license-detail": "licenses",
};

function NavItem({
  item,
  isActive,
  onClick,
  showLabel,
}: {
  item: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; description: string };
  isActive: boolean;
  onClick: () => void;
  showLabel: boolean;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full h-10 rounded-lg transition-all duration-200 group relative",
        showLabel ? "justify-start gap-3 px-3" : "justify-center px-0",
        isActive
          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-400"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="active-nav"
          className="absolute inset-0 rounded-lg border border-emerald-500/20"
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      )}
      <item.icon className={cn(
        "relative h-[18px] w-[18px] shrink-0 transition-colors",
        isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
      )} />
      {showLabel && (
        <span className={cn(
          "text-[13px] font-medium truncate transition-colors",
          isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
        )}>
          {item.label}
        </span>
      )}
    </Button>
  );
}

export function AppSidebar() {
  const { currentView, setView, sidebarOpen, setSidebarOpen, sidebarPinned, setSidebarPinned, user } = useAppStore();
  const userRole = (user?.role as "admin" | "manager" | "staff" | "user" | "guest") || "guest";
  
  // Auto-open sidebar for admin users
  useEffect(() => {
    if (userRole === "admin" && !sidebarOpen && !sidebarPinned) {
      setSidebarOpen(true);
    }
  }, [userRole, sidebarOpen, sidebarPinned, setSidebarOpen]);
  
  const isAdmin = userRole === "admin";
  
  const isItemAccessible = (itemId: string) => {
    // Admin always has access
    if (isAdmin) return true;
    return canAccess(userRole, itemId);
  };
  
  const [flyoutItem, setFlyoutItem] = useState<{ item: typeof allNavItems[number]; y: number } | null>(null);
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const EXPAND_DELAY = 3000;

  const startExpandTimer = useCallback(() => {
    if (sidebarOpen || sidebarPinned) return;
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    expandTimerRef.current = setTimeout(() => {
      setSidebarOpen(true);
      setFlyoutItem(null);
    }, EXPAND_DELAY);
  }, [sidebarOpen, setSidebarOpen, sidebarPinned]);

  const cancelExpandTimer = useCallback(() => {
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (sidebarPinned) return;
    startExpandTimer();
  }, [startExpandTimer, sidebarPinned]);

  const handleMouseLeave = useCallback(() => {
    if (sidebarPinned) return;
    cancelExpandTimer();
    setFlyoutItem(null);
    if (sidebarOpen) {
      expandTimerRef.current = setTimeout(() => {
        setSidebarOpen(false);
      }, 150);
    }
  }, [sidebarOpen, setSidebarOpen, cancelExpandTimer, sidebarPinned]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (sidebarOpen || sidebarPinned) return;
    const rect = sidebarRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseY = e.clientY - rect.top;
    const itemHeight = 40;
    const navStartY = 72 + 1 + 20;
    const relativeY = mouseY - navStartY;
    const itemIndex = Math.floor(relativeY / (itemHeight + 2));

    if (itemIndex >= 0 && itemIndex < allNavItems.length) {
      setFlyoutItem({ item: allNavItems[itemIndex], y: mouseY });
    } else {
      setFlyoutItem(null);
    }
  }, [sidebarOpen, sidebarPinned]);

  useEffect(() => {
    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    };
  }, []);

  const showLabels = sidebarOpen;

  return (
    <div className="fixed left-0 top-0 z-40 h-screen">
      {/* Invisible trigger zone */}
      {!sidebarOpen && (
        <div
          className="absolute left-0 top-0 z-30 h-screen w-2 cursor-pointer"
          onMouseEnter={handleMouseEnter}
        />
      )}
      <aside
        ref={sidebarRef}
        className={cn(
          "flex h-screen flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          sidebarOpen ? "w-[260px]" : "w-[68px]",
          "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/50"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {/* Brand Area */}
        <div className="relative flex h-[72px] items-center gap-3 px-4">
          <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-[15px] font-bold text-white tracking-tight">IT Manager</span>
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.15em]">
                  IT Department Management Portal
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="mx-3 bg-slate-800/60" />

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 p-2.5 pt-5 overflow-y-auto">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]"
              >
                Main
              </motion.p>
            )}
          </AnimatePresence>
          {/* Main Section - Always show for admin */}
          {(isAdmin || navItems.some(item => isItemAccessible(item.id))) && navItems.map((item) => {
            const isActive = currentView === item.id || Object.entries(detailViews).some(([d, p]) => currentView === d && p === item.id);
            return (
              <NavItem
                key={item.id}
                item={item}
                isActive={isActive}
                showLabel={showLabels}
                onClick={() => {
                  setView(item.id);
                  cancelExpandTimer();
                  if (sidebarOpen && !sidebarPinned) {
                    expandTimerRef.current = setTimeout(() => setSidebarOpen(false), 150);
                  }
                }}
              />
            );
          })}

          <Separator className="my-3 bg-slate-800/40" />

          <AnimatePresence>
            {sidebarOpen && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]"
              >
                Operations
              </motion.p>
            )}
          </AnimatePresence>
          {/* Secondary Section */}
          {(isAdmin || navItemsSecondary.some(item => isItemAccessible(item.id))) && navItemsSecondary.map((item) => {
            const isActive = currentView === item.id || Object.entries(detailViews).some(([d, p]) => currentView === d && p === item.id);
            return (
              <NavItem
                key={item.id}
                item={item}
                isActive={isActive}
                showLabel={showLabels}
                onClick={() => {
                  setView(item.id);
                  cancelExpandTimer();
                  if (sidebarOpen && !sidebarPinned) {
                    expandTimerRef.current = setTimeout(() => setSidebarOpen(false), 150);
                  }
                }}
              />
            );
          })}

          <Separator className="my-3 bg-slate-800/40" />

          <AnimatePresence>
            {sidebarOpen && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]"
              >
                User Settings
              </motion.p>
            )}
          </AnimatePresence>
          {navItemsUser.map((item) => {
            const isActive = currentView === item.id;
            return (
              <NavItem
                key={item.id}
                item={item}
                isActive={isActive}
                showLabel={showLabels}
                onClick={() => {
                  setView(item.id);
                  cancelExpandTimer();
                  if (sidebarOpen && !sidebarPinned) {
                    expandTimerRef.current = setTimeout(() => setSidebarOpen(false), 150);
                  }
                }}
              />
            );
          })}

          <Separator className="my-3 bg-slate-800/40" />

          <AnimatePresence>
            {sidebarOpen && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]"
              >
                Admin
              </motion.p>
            )}
          </AnimatePresence>
          {/* Admin Section - Only show for admin */}
          {isAdmin && navItemsAdmin.map((item) => {
            const isActive = currentView === item.id || Object.entries(detailViews).some(([d, p]) => currentView === d && p === item.id);
            return (
              <NavItem
                key={item.id}
                item={item}
                isActive={isActive}
                showLabel={showLabels}
                onClick={() => {
                  setView(item.id);
                  cancelExpandTimer();
                  if (sidebarOpen && !sidebarPinned) {
                    expandTimerRef.current = setTimeout(() => setSidebarOpen(false), 150);
                  }
                }}
              />
            );
          })}
        </nav>

        <Separator className="mx-3 bg-slate-800/60" />

        {/* Footer */}
        <div className="p-2.5">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="mb-2 rounded-xl bg-slate-800/40 p-3 border border-slate-700/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 text-[11px] font-bold text-white shadow-md">
                    IT
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[13px] font-semibold text-white truncate">IT Manager</span>
                    <span className="text-[11px] text-slate-400 truncate">System Administrator</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-700">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Active</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarPinned(!sidebarPinned)}
              className={cn(
                "flex-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg",
                sidebarOpen ? "justify-center px-2" : "justify-center px-0"
              )}
              title={sidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              {sidebarPinned ? (
                <Pin className="h-4 w-4 text-emerald-400" />
              ) : (
                <PinOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                cancelExpandTimer();
                if (!sidebarPinned) {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className={cn(
                "flex-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg",
                sidebarOpen ? "justify-start px-3 gap-2" : "justify-center px-0"
              )}
            >
              {sidebarOpen ? (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-[12px] font-medium">Collapse</span>
                </>
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Flyout tooltip at mouse position - immediate on hover */}
      <AnimatePresence>
        {flyoutItem && !sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.96 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 pointer-events-none"
            style={{ left: 72, top: flyoutItem.y - 22 }}
          >
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl px-3 py-2 min-w-[170px] flex items-center gap-2.5">
              <flyoutItem.item.icon className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[13px] font-semibold text-white">{flyoutItem.item.label}</div>
                <div className="text-[11px] text-slate-400">{flyoutItem.item.description}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
