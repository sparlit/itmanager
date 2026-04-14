import { create } from "zustand";
import type { ViewType } from "@/types";

interface AppState {
  currentView: ViewType;
  selectedItemId: string | null;
  setView: (view: ViewType, itemId?: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarPinned: boolean;
  setSidebarPinned: (pinned: boolean) => void;
  user: { userId: string; username: string; role: string; name: string; email: string } | null;
  setUser: (user: AppState["user"]) => void;
  permissions: string[];
  setPermissions: (permissions: string[]) => void;
  showAnimations: boolean;
  setShowAnimations: (show: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "dashboard",
  selectedItemId: null,
  setView: (view, itemId = null) =>
    set({ currentView: view, selectedItemId: itemId }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  sidebarPinned: false,
  setSidebarPinned: (pinned) => set({ sidebarPinned: pinned }),
  user: null,
  setUser: (user) => set({ user }),
  permissions: [],
  setPermissions: (permissions) => set({ permissions }),
  showAnimations: false,
  setShowAnimations: (show) => set({ showAnimations: show }),
}));
