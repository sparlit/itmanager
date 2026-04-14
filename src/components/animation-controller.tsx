"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export function AnimationController() {
  const { showAnimations, setShowAnimations } = useAppStore();

  // Load preference from API on mount
  useEffect(() => {
    async function loadPreference() {
      try {
        const res = await fetch("/api/auth/preferences");
        if (res.ok) {
          const data = await res.json();
          if (data.preferences?.showAnimations !== undefined) {
            setShowAnimations(data.preferences.showAnimations);
          }
        }
      } catch (e) {
        console.error("Failed to load animation preference:", e);
      }
    }
    loadPreference();
  }, [setShowAnimations]);

  // Update CSS variable when preference changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--enable-animations",
      showAnimations ? "1" : "0"
    );
  }, [showAnimations]);

  return null;
}
