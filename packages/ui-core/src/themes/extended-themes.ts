import { ThemeConfig } from "./theme-engine";

export const EXTENDED_DEPARTMENT_THEMES: Record<string, ThemeConfig> = {
  administration: {
    primary: "#0F172A",
    secondary: "#64748B",
    accent: "#3B82F6",
    background: "#F8FAFC",
    foreground: "#020617",
    fontFamily: "sans",
    visualEffects: "minimal",
  },
  sales: {
    primary: "#BE123C", // Rose-700
    secondary: "#F43F5E",
    accent: "#FB7185",
    background: "#FFF1F2",
    foreground: "#4C0519",
    fontFamily: "sans",
    visualEffects: "glassmorphism",
  },
  marketing: {
    primary: "#7E22CE", // Purple-700
    secondary: "#A855F7",
    accent: "#C084FC",
    background: "#FAF5FF",
    foreground: "#3B0764",
    fontFamily: "sans",
    visualEffects: "glassmorphism",
  },
  customer_service: {
    primary: "#0369A1", // Cyan-700
    secondary: "#0EA5E9",
    accent: "#38BDF8",
    background: "#F0F9FF",
    foreground: "#082F49",
    fontFamily: "sans",
    visualEffects: "minimal",
  },
  production: {
    primary: "#B45309", // Amber-700
    secondary: "#D97706",
    accent: "#F59E0B",
    background: "#FFFBEB",
    foreground: "#451A03",
    fontFamily: "sans",
    visualEffects: "industrial",
  },
  transport: {
    primary: "#111827", // Gray-900
    secondary: "#374151",
    accent: "#FACC15", // Yellow for contrast
    background: "#111827",
    foreground: "#F9FAFB",
    fontFamily: "sans",
    visualEffects: "industrial",
  },
  it: {
    primary: "#00FF41",
    secondary: "#003B00",
    accent: "#008F11",
    background: "#0D0208",
    foreground: "#00FF41",
    fontFamily: "mono",
    visualEffects: "sci-fi",
  },
  finance: {
    primary: "#15803D", // Green-700
    secondary: "#22C55E",
    accent: "#4ADE80",
    background: "#F0FDF4",
    foreground: "#052E16",
    fontFamily: "sans",
    visualEffects: "minimal",
  },
  security: {
    primary: "#7F1D1D", // Red-900
    secondary: "#450A0A",
    accent: "#EF4444",
    background: "#0A0A0A",
    foreground: "#F87171",
    fontFamily: "mono",
    visualEffects: "sci-fi",
  },
};
