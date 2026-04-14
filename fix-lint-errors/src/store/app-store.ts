import { create } from "zustand";
import type { ViewType } from "@/types";

interface AppState {
  currentView: ViewType;
  selectedItemId: string | null;
  setView: (view: ViewType, itemId?: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "dashboard",
  selectedItemId: null,
  setView: (view, itemId = null) =>
    set({ currentView: view, selectedItemId: itemId }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
