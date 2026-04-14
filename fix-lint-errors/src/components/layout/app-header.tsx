"use client";

import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Menu, Command } from "lucide-react";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { formatDistanceToNow } from "date-fns";

const viewLabels: Record<string, string> = {
  dashboard: "Dashboard",
  tickets: "Ticket Management",
  "ticket-detail": "Ticket Details",
  assets: "Asset Management",
  "asset-detail": "Asset Details",
  inventory: "Inventory Management",
  "inventory-detail": "Inventory Details",
  staff: "Team Directory",
  "staff-detail": "Team Member Details",
  vendors: "Vendor Management",
  "vendor-detail": "Vendor Details",
  "knowledge-base": "Knowledge Base",
  "knowledge-base-detail": "Article Details",
  calendar: "Calendar",
  reports: "Reports & Analytics",
  licenses: "Software Licenses",
  "license-detail": "License Details",
  changes: "Change Management",
  "change-detail": "Change Details",
  "time-tracking": "Time Tracking",
  "audit-log": "Audit Log",
  "sla-config": "SLA Policies",
  "service-catalog": "Service Catalog",
  budgets: "Budget Management",
  backups: "Backup Management",
  notifications: "Notifications",
};

const viewDescriptions: Record<string, string> = {
  dashboard: "Real-time overview of your IT operations",
  tickets: "Track, manage, and resolve support tickets",
  "ticket-detail": "View ticket details and communicate",
  assets: "Track hardware, software, and IT assets",
  "asset-detail": "View asset information and history",
  inventory: "Manage consumables and stock levels",
  "inventory-detail": "Item details and transaction history",
  staff: "Your team members and their roles",
  "staff-detail": "Team member profile and assignments",
  vendors: "Suppliers, contracts, and vendor management",
  "vendor-detail": "Vendor profile and contract details",
  "knowledge-base": "IT articles, guides, and FAQs",
  "knowledge-base-detail": "Read and reference article",
  calendar: "Schedule, events, and upcoming deadlines",
  reports: "Data-driven insights and performance metrics",
  licenses: "Manage software licenses and subscriptions",
  "license-detail": "License details and seat assignments",
  changes: "Track and approve IT change requests",
  "change-detail": "Change request details and approval",
  "time-tracking": "Log and track time spent on tasks",
  "audit-log": "System-wide activity and change history",
  "sla-config": "Configure service level agreement targets",
  "service-catalog": "Browse and request IT services",
  budgets: "Track department budgets and spending",
  backups: "Manage and monitor data backups",
  notifications: "System alerts, warnings, and updates",
};

type Notification = {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl: string | null;
};

export function AppHeader() {
  const { currentView, setSidebarOpen, setView } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    tickets: { id: string; title: string; status: string; priority: string }[];
    assets: { id: string; name: string; status: string; category: string }[];
    staff: { id: string; name: string; role: string; department: string }[];
    inventory: { id: string; name: string; category: string; quantity: number }[];
  } | null>(null);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications on mount
  useEffect(() => {
    async function fetchNotifications() {
      setNotifLoading(true);
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const json = await res.json();
          setNotifications(json.notifications || []);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setNotifLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  // Handle notification click – navigate to the relevant view
  const handleNotifClick = useCallback(
    (notif: Notification) => {
      if (!notif.actionUrl) return;
      const url = notif.actionUrl;

      if (url.startsWith("/tickets/")) {
        const id = url.replace("/tickets/", "");
        setView("ticket-detail", id);
      } else if (url.startsWith("/assets/")) {
        const id = url.replace("/assets/", "");
        setView("asset-detail", id);
      } else if (url.startsWith("/inventory")) {
        setView("inventory");
      } else if (url.startsWith("/reports")) {
        setView("reports");
      } else if (url.startsWith("/staff/")) {
        const id = url.replace("/staff/", "");
        setView("staff-detail", id);
      } else if (url.startsWith("/tickets")) {
        setView("tickets");
      } else if (url.startsWith("/assets")) {
        setView("assets");
      } else if (url.startsWith("/staff")) {
        setView("staff");
      }
    },
    [setView]
  );

  // Global keyboard listener for Ctrl/Cmd+K to open shortcuts dialog
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        setShortcutsOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown, true);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    }
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function handleSearch(query: string) {
    if (!query.trim()) {
      setSearchResults(null);
      setSearchOpen(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      setSearchOpen(true);
      try {
        const params = new URLSearchParams({ search: query });
        const [ticketsRes, assetsRes, staffRes, inventoryRes] = await Promise.all([
          fetch(`/api/tickets?${params.toString()}`).then((r) => (r.ok ? r.json() : { tickets: [] })),
          fetch(`/api/assets?${params.toString()}`).then((r) => (r.ok ? r.json() : { assets: [] })),
          fetch(`/api/staff?${params.toString()}`).then((r) => (r.ok ? r.json() : { staff: [] })),
          fetch(`/api/inventory?${params.toString()}`).then((r) => (r.ok ? r.json() : { items: [] })),
        ]);

        setSearchResults({
          tickets: (ticketsRes.tickets || []).slice(0, 3).map((t: any) => ({ id: t.id, title: t.title, status: t.status, priority: t.priority })),
          assets: (assetsRes.assets || []).slice(0, 3).map((a: any) => ({ id: a.id, name: a.name, status: a.status, category: a.category })),
          staff: (staffRes.staff || []).slice(0, 3).map((s: any) => ({ id: s.id, name: s.name, role: s.role, department: s.department })),
          inventory: (inventoryRes.items || []).slice(0, 3).map((i: any) => ({ id: i.id, name: i.name, category: i.category, quantity: i.quantity })),
        });
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function handleSearchNavigate(type: string, id: string) {
    setSearchOpen(false);
    const input = document.querySelector<HTMLInputElement>('input[placeholder="Search anything..."]');
    if (input) input.value = "";
    setSearchResults(null);

    switch (type) {
      case "ticket":
        setView("ticket-detail", id);
        break;
      case "asset":
        setView("asset-detail", id);
        break;
      case "staff":
        setView("staff-detail", id);
        break;
      case "inventory":
        setView("inventory");
        break;
    }
  }

  function getDotColor(type: Notification["type"]) {
    switch (type) {
      case "critical":
        return "bg-rose-500";
      case "warning":
        return "bg-amber-500";
      case "info":
        return "bg-sky-500";
      default:
        return "bg-slate-400";
    }
  }

  function getBorderColor(type: Notification["type"]) {
    switch (type) {
      case "critical":
        return "border-l-rose-500";
      case "warning":
        return "border-l-amber-500";
      case "info":
        return "border-l-sky-500";
      default:
        return "border-l-slate-400";
    }
  }

  function handleViewAll() {
    // Navigate to the view that has the most notifications
    const viewCounts: Record<string, number> = {};
    for (const n of notifications) {
      if (n.actionUrl) {
        let viewKey = n.actionUrl;
        // Normalize to base path (without id)
        if (viewKey.match(/^\/(tickets|assets|staff)\/[^/]+$/)) {
          viewKey = viewKey.replace(/\/[^/]+$/, "");
        }
        viewCounts[viewKey] = (viewCounts[viewKey] || 0) + 1;
      }
    }
    const topPath = Object.entries(viewCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    if (topPath === "/tickets") setView("tickets");
    else if (topPath === "/assets") setView("assets");
    else if (topPath === "/staff") setView("staff");
    else if (topPath === "/inventory") setView("inventory");
    else if (topPath === "/reports") setView("reports");
    else setView("tickets");
  }

  return (
    <>
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <motion.h1
            key={currentView}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[17px] font-semibold text-slate-900 dark:text-slate-50 truncate"
          >
            {viewLabels[currentView] || "Dashboard"}
          </motion.h1>
          <motion.p
            key={`${currentView}-desc`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[12px] text-slate-400 truncate hidden sm:block"
          >
            {viewDescriptions[currentView] || ""}
          </motion.p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Time display */}
          <div className="hidden md:flex items-center gap-2 mr-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <span className="text-[12px] text-slate-400 font-medium">{date}</span>
            <span className="text-[13px] text-slate-700 dark:text-slate-200 font-semibold tabular-nums">{time}</span>
          </div>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search anything..."
              className="w-[200px] lg:w-[220px] pl-9 h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[13px] placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-300 dark:focus-visible:border-emerald-600 rounded-lg dark:text-slate-100"
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults && setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] text-slate-400 font-medium cursor-pointer hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-400 transition-colors"
              onClick={() => setShortcutsOpen(true)}
            >
              <Command className="h-2.5 w-2.5" />K
            </button>

            {/* Search Results Dropdown */}
            {searchOpen && searchResults && (
              <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden min-w-[320px] max-h-[400px] overflow-y-auto">
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
                  </div>
                ) : (
                  <div className="p-2">
                    {searchResults.tickets.length === 0 && searchResults.assets.length === 0 && searchResults.staff.length === 0 && searchResults.inventory.length === 0 ? (
                      <p className="text-[13px] text-slate-400 text-center py-6">No results found</p>
                    ) : (
                      <>
                        {searchResults.tickets.length > 0 && (
                          <div className="mb-1">
                            <p className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tickets</p>
                            {searchResults.tickets.map((t) => (
                              <button key={t.id} className="w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" onMouseDown={() => handleSearchNavigate("ticket", t.id)}>
                                <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">{t.title}</p>
                                <p className="text-[11px] text-slate-400">{t.status} · {t.priority}</p>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.assets.length > 0 && (
                          <div className="mb-1">
                            <p className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Assets</p>
                            {searchResults.assets.map((a) => (
                              <button key={a.id} className="w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" onMouseDown={() => handleSearchNavigate("asset", a.id)}>
                                <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">{a.name}</p>
                                <p className="text-[11px] text-slate-400">{a.category} · {a.status}</p>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.staff.length > 0 && (
                          <div className="mb-1">
                            <p className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Team</p>
                            {searchResults.staff.map((s) => (
                              <button key={s.id} className="w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" onMouseDown={() => handleSearchNavigate("staff", s.id)}>
                                <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">{s.name}</p>
                                <p className="text-[11px] text-slate-400">{s.role} · {s.department}</p>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.inventory.length > 0 && (
                          <div>
                            <p className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Inventory</p>
                            {searchResults.inventory.map((i) => (
                              <button key={i.id} className="w-full text-left px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" onMouseDown={() => handleSearchNavigate("inventory", i.id)}>
                                <p className="text-[13px] font-medium text-slate-900 dark:text-slate-100 truncate">{i.name}</p>
                                <p className="text-[11px] text-slate-400">{i.category} · {i.quantity} in stock</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={toggleTheme}
          >
            {isMounted && (
              <motion.div
                key={theme}
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === "dark" ? (
                  <svg className="h-[18px] w-[18px] text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                ) : (
                  <svg className="h-[18px] w-[18px] text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
              </motion.div>
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <Bell className="h-[18px] w-[18px] text-slate-500 dark:text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm shadow-rose-500/30">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <DropdownMenuLabel className="p-0 text-[14px] font-semibold text-slate-900 dark:text-slate-50">Notifications</DropdownMenuLabel>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                    : "You're all caught up"}
                </p>
              </div>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700" />
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    <p className="text-[13px] text-slate-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <DropdownMenuItem
                      key={notif.id}
                      className={`flex flex-col items-start gap-1.5 py-3 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-l-[3px] ${getBorderColor(notif.type)} ${!notif.read ? "bg-slate-50/50 dark:bg-slate-700/30" : ""}`}
                      onClick={() => handleNotifClick(notif)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getDotColor(notif.type)} ${!notif.read ? "pulse-dot" : ""}`} />
                        <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">{notif.title}</span>
                      </div>
                      <span className="text-[12px] text-slate-400 pl-4 line-clamp-2">{notif.description}</span>
                      <span className="text-[11px] text-slate-300 dark:text-slate-500 pl-4">
                        {notif.timestamp ? formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true }) : ""}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700" />
                  <div className="px-2 py-1.5">
                    <button
                      className="w-full text-center text-[12px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      onClick={handleViewAll}
                    >
                      View all notifications
                    </button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2.5 h-9 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <Avatar className="h-7 w-7 ring-2 ring-emerald-100 dark:ring-emerald-900">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-400 text-[10px] font-bold text-white">
                    IT
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-none">IT Manager</span>
                  <span className="text-[10px] text-slate-400">Admin</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <DropdownMenuLabel className="text-[13px] font-semibold text-slate-900 dark:text-slate-50">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700" />
              <DropdownMenuItem className="text-[13px] cursor-pointer rounded-lg">Profile Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-[13px] cursor-pointer rounded-lg">Preferences</DropdownMenuItem>
              <DropdownMenuItem className="text-[13px] cursor-pointer rounded-lg">Help Center</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700" />
              <DropdownMenuItem className="text-[13px] text-rose-600 cursor-pointer rounded-lg focus:bg-rose-50 focus:text-rose-700 dark:focus:bg-rose-900/20 dark:focus:text-rose-400">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
}
