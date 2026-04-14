"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";
import { useTheme } from "next-themes";
import {
  Search,
  LayoutDashboard,
  Ticket,
  Package,
  Warehouse,
  Users,
  BarChart3,
  Plus,
  PanelLeft,
  Moon,
  Building2,
  BookOpen,
  CalendarDays,
} from "lucide-react";
import type { ViewType } from "@/types";
import type { LucideIcon } from "lucide-react";

interface ShortcutItem {
  id: string;
  label: string;
  icon: LucideIcon;
  keys: string[];
  category: "navigation" | "action";
  action: () => void;
}

function getShortcuts(
  setView: (view: ViewType, itemId?: string | null) => void,
  setSidebarOpen: (open: boolean) => void,
  theme: string | undefined,
  setTheme: (theme: string) => void
): ShortcutItem[] {
  return [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      keys: ["mod", "1"],
      category: "navigation",
      action: () => setView("dashboard"),
    },
    {
      id: "tickets",
      label: "Tickets",
      icon: Ticket,
      keys: ["mod", "2"],
      category: "navigation",
      action: () => setView("tickets"),
    },
    {
      id: "assets",
      label: "Assets",
      icon: Package,
      keys: ["mod", "3"],
      category: "navigation",
      action: () => setView("assets"),
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Warehouse,
      keys: ["mod", "4"],
      category: "navigation",
      action: () => setView("inventory"),
    },
    {
      id: "team",
      label: "Team",
      icon: Users,
      keys: ["mod", "5"],
      category: "navigation",
      action: () => setView("staff"),
    },
    {
      id: "vendors",
      label: "Vendors",
      icon: Building2,
      keys: ["mod", "6"],
      category: "navigation",
      action: () => setView("vendors"),
    },
    {
      id: "knowledge-base",
      label: "Knowledge Base",
      icon: BookOpen,
      keys: ["mod", "7"],
      category: "navigation",
      action: () => setView("knowledge-base"),
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: CalendarDays,
      keys: ["mod", "8"],
      category: "navigation",
      action: () => setView("calendar"),
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      keys: ["mod", "9"],
      category: "navigation",
      action: () => setView("reports"),
    },
    {
      id: "new-ticket",
      label: "New Ticket",
      icon: Plus,
      keys: ["mod", "N"],
      category: "action",
      action: () => setView("tickets"),
    },
    {
      id: "toggle-sidebar",
      label: "Toggle Sidebar",
      icon: PanelLeft,
      keys: ["mod", "B"],
      category: "action",
      action: () => setSidebarOpen(!useAppStore.getState().sidebarOpen),
    },
    {
      id: "toggle-theme",
      label: "Toggle Theme",
      icon: Moon,
      keys: ["mod", "D"],
      category: "action",
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
  ];
}

function useIsMac() {
  // Compute once on mount without triggering re-render from setState in effect
  const [isMac] = useState(() => {
    if (typeof navigator === "undefined") return false;
    return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  });

  return isMac;
}

function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) return <>{text}</>;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-sm px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const { setView, setSidebarOpen } = useAppStore();
  const { theme, setTheme } = useTheme();
  const isMac = useIsMac();
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const shortcuts = useMemo(
    () => getShortcuts(setView, setSidebarOpen, theme, setTheme),
    [setView, setSidebarOpen, theme, setTheme]
  );

  const filteredShortcuts = useMemo(() => {
    if (!search.trim()) return shortcuts;
    const q = search.toLowerCase();
    return shortcuts.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [shortcuts, search]);

  // Track focused index for use in event handlers
  const lastFocusedRef = useRef(0);
  const updateFocused = useCallback((val: number | ((prev: number) => number)) => {
    setFocusedIndex((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      lastFocusedRef.current = next;
      return next;
    });
  }, []);

  // Reset search when dialog opens (derive from open prop)
  const effectiveSearch = open ? search : "";

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure dialog has rendered
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const executeShortcut = useCallback(
    (shortcut: ShortcutItem) => {
      shortcut.action();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (filteredShortcuts.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          updateFocused((prev) =>
            prev < filteredShortcuts.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          updateFocused((prev) =>
            prev > 0 ? prev - 1 : filteredShortcuts.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          const idx = lastFocusedRef.current;
          if (idx >= 0 && idx < filteredShortcuts.length) {
            executeShortcut(filteredShortcuts[idx]);
          }
          break;
      }
    },
    [filteredShortcuts, executeShortcut, updateFocused]
  );

  // Scroll focused item into view
  useEffect(() => {
    if (!listRef.current || focusedIndex < 0) return;
    const items = listRef.current.querySelectorAll<HTMLButtonElement>(
      "[data-shortcut-item]"
    );
    items[focusedIndex]?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  function renderKey(key: string) {
    if (key === "mod") {
      return isMac ? "⌘" : "Ctrl";
    }
    return key;
  }

  const navigationShortcuts = filteredShortcuts.filter(
    (s) => s.category === "navigation"
  );
  const actionShortcuts = filteredShortcuts.filter(
    (s) => s.category === "action"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Search header */}
        <div className="px-5 pt-5 pb-3">
          <DialogHeader className="space-y-0 text-left mb-3">
            <DialogTitle className="text-[16px] font-semibold text-slate-900 dark:text-slate-50">
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription className="text-[13px] text-slate-400 mt-1">
              Search and execute shortcuts to navigate quickly
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              ref={inputRef}
              placeholder="Search shortcuts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 h-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-[13px] placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-300 dark:focus-visible:border-emerald-600 rounded-lg"
            />
          </div>
        </div>

        {/* Shortcuts list */}
        <div
          ref={listRef}
          className="px-3 pb-4 max-h-[340px] overflow-y-auto"
        >
          {filteredShortcuts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="text-[13px] text-slate-400">
                No shortcuts match &ldquo;{search}&rdquo;
              </p>
            </div>
          ) : (
            <>
              {navigationShortcuts.length > 0 && (
                <div className="mb-3">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Navigation
                  </p>
                  {navigationShortcuts.map((shortcut) => {
                    const globalIndex = filteredShortcuts.indexOf(shortcut);
                    return (
                      <button
                        key={shortcut.id}
                        data-shortcut-item
                        onClick={() => executeShortcut(shortcut)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-left group ${
                          focusedIndex === globalIndex
                            ? "bg-emerald-50 dark:bg-emerald-900/20"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            focusedIndex === globalIndex
                              ? "bg-emerald-100 dark:bg-emerald-800/40"
                              : "bg-slate-50 group-hover:bg-emerald-50 dark:bg-slate-800 dark:group-hover:bg-emerald-900/30"
                          }`}
                        >
                          <shortcut.icon
                            className={`h-4 w-4 ${
                              focusedIndex === globalIndex
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                            }`}
                          />
                        </div>
                        <span
                          className={`flex-1 text-[13px] font-medium ${
                            focusedIndex === globalIndex
                              ? "text-emerald-900 dark:text-emerald-200"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <HighlightedText
                            text={shortcut.label}
                            query={search}
                          />
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, ki) => (
                            <kbd
                              key={ki}
                              className={`inline-flex h-6 items-center rounded border px-1.5 font-mono text-[11px] ${
                                focusedIndex === globalIndex
                                  ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {renderKey(key)}
                            </kbd>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {actionShortcuts.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </p>
                  {actionShortcuts.map((shortcut) => {
                    const globalIndex = filteredShortcuts.indexOf(shortcut);
                    return (
                      <button
                        key={shortcut.id}
                        data-shortcut-item
                        onClick={() => executeShortcut(shortcut)}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-left group ${
                          focusedIndex === globalIndex
                            ? "bg-emerald-50 dark:bg-emerald-900/20"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            focusedIndex === globalIndex
                              ? "bg-emerald-100 dark:bg-emerald-800/40"
                              : "bg-slate-50 group-hover:bg-emerald-50 dark:bg-slate-800 dark:group-hover:bg-emerald-900/30"
                          }`}
                        >
                          <shortcut.icon
                            className={`h-4 w-4 ${
                              focusedIndex === globalIndex
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                            }`}
                          />
                        </div>
                        <span
                          className={`flex-1 text-[13px] font-medium ${
                            focusedIndex === globalIndex
                              ? "text-emerald-900 dark:text-emerald-200"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <HighlightedText
                            text={shortcut.label}
                            query={search}
                          />
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, ki) => (
                            <kbd
                              key={ki}
                              className={`inline-flex h-6 items-center rounded border px-1.5 font-mono text-[11px] ${
                                focusedIndex === globalIndex
                                  ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {renderKey(key)}
                            </kbd>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        {filteredShortcuts.length > 0 && (
          <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <kbd className="inline-flex h-5 items-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1 font-mono text-[10px] text-slate-400">
                  ↑
                </kbd>
                <kbd className="inline-flex h-5 items-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1 font-mono text-[10px] text-slate-400">
                  ↓
                </kbd>
                <span>navigate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="inline-flex h-5 items-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] text-slate-400">
                  ↵
                </kbd>
                <span>execute</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="inline-flex h-5 items-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] text-slate-400">
                  esc
                </kbd>
                <span>close</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
