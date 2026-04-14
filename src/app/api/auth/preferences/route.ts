import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

interface PreferenceFields {
  language?: string;
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  compactMode?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showAnimations?: boolean;
  theme?: string;
  fontSize?: string;
  sidebarStyle?: string;
  smoothScrolling?: boolean;
  enableTransitions?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  notificationSound?: boolean;
  dailyDigest?: boolean;
  dataCache?: boolean;
  chatEnabled?: boolean;
  chatPosition?: string;
  dashboardLayout?: string;
  itemsPerPage?: number;
  showWelcome?: boolean;
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: PreferenceFields = await req.json();

    const updated = await db.userPreferences.upsert({
      where: { userId: user.userId },
      update: {
        language: body.language || "en",
        timezone: body.timezone || "UTC",
        dateFormat: body.dateFormat || "MM/DD/YYYY",
        currency: body.currency || "QAR",
        compactMode: body.compactMode ?? false,
        autoRefresh: body.autoRefresh ?? true,
        refreshInterval: body.refreshInterval ?? 30,
        showAnimations: body.showAnimations ?? true,
        theme: body.theme || "system",
        fontSize: body.fontSize || "medium",
        sidebarStyle: body.sidebarStyle || "expanded",
        smoothScrolling: body.smoothScrolling ?? true,
        enableTransitions: body.enableTransitions ?? true,
        emailNotifications: body.emailNotifications ?? true,
        pushNotifications: body.pushNotifications ?? false,
        notificationSound: body.notificationSound ?? true,
        dailyDigest: body.dailyDigest ?? false,
        dataCache: body.dataCache ?? true,
        chatEnabled: body.chatEnabled ?? true,
        chatPosition: body.chatPosition || "bottom-right",
        dashboardLayout: body.dashboardLayout || "default",
        itemsPerPage: body.itemsPerPage ?? 20,
        showWelcome: body.showWelcome ?? true,
      },
      create: {
        userId: user.userId,
        language: body.language || "en",
        timezone: body.timezone || "UTC",
        dateFormat: body.dateFormat || "MM/DD/YYYY",
        currency: body.currency || "QAR",
        compactMode: body.compactMode ?? false,
        autoRefresh: body.autoRefresh ?? true,
        refreshInterval: body.refreshInterval ?? 30,
        showAnimations: body.showAnimations ?? true,
        theme: body.theme || "system",
        fontSize: body.fontSize || "medium",
        sidebarStyle: body.sidebarStyle || "expanded",
        smoothScrolling: body.smoothScrolling ?? true,
        enableTransitions: body.enableTransitions ?? true,
        emailNotifications: body.emailNotifications ?? true,
        pushNotifications: body.pushNotifications ?? false,
        notificationSound: body.notificationSound ?? true,
        dailyDigest: body.dailyDigest ?? false,
        dataCache: body.dataCache ?? true,
        chatEnabled: body.chatEnabled ?? true,
        chatPosition: body.chatPosition || "bottom-right",
        dashboardLayout: body.dashboardLayout || "default",
        itemsPerPage: body.itemsPerPage ?? 20,
        showWelcome: body.showWelcome ?? true,
      },
    });

    return NextResponse.json({ 
      message: "Preferences saved",
      preferences: {
        language: updated.language,
        timezone: updated.timezone,
        dateFormat: updated.dateFormat,
        currency: updated.currency,
        compactMode: updated.compactMode,
        autoRefresh: updated.autoRefresh,
        refreshInterval: updated.refreshInterval,
        showAnimations: updated.showAnimations,
        theme: updated.theme,
        fontSize: updated.fontSize,
        sidebarStyle: updated.sidebarStyle,
        smoothScrolling: updated.smoothScrolling,
        enableTransitions: updated.enableTransitions,
        emailNotifications: updated.emailNotifications,
        pushNotifications: updated.pushNotifications,
        notificationSound: updated.notificationSound,
        dailyDigest: updated.dailyDigest,
        dataCache: updated.dataCache,
        chatEnabled: updated.chatEnabled,
        chatPosition: updated.chatPosition,
        dashboardLayout: updated.dashboardLayout,
        itemsPerPage: updated.itemsPerPage,
        showWelcome: updated.showWelcome,
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save preferences";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prefs = await db.userPreferences.findUnique({
      where: { userId: user.userId },
    });
    
    if (!prefs) {
      return NextResponse.json({ 
        preferences: {
          language: "en",
          timezone: "UTC",
          dateFormat: "MM/DD/YYYY",
          currency: "QAR",
          compactMode: false,
          autoRefresh: true,
          refreshInterval: 30,
          showAnimations: true,
          theme: "system",
          fontSize: "medium",
          sidebarStyle: "expanded",
          smoothScrolling: true,
          enableTransitions: true,
          emailNotifications: true,
          pushNotifications: false,
          notificationSound: true,
          dailyDigest: false,
          dataCache: true,
          chatEnabled: true,
          chatPosition: "bottom-right",
          dashboardLayout: "default",
          itemsPerPage: 20,
          showWelcome: true,
        }
      });
    }

    return NextResponse.json({ 
      preferences: {
        language: prefs.language,
        timezone: prefs.timezone,
        dateFormat: prefs.dateFormat,
        currency: prefs.currency,
        compactMode: prefs.compactMode,
        autoRefresh: prefs.autoRefresh,
        refreshInterval: prefs.refreshInterval,
        showAnimations: prefs.showAnimations,
        theme: prefs.theme,
        fontSize: prefs.fontSize,
        sidebarStyle: prefs.sidebarStyle,
        smoothScrolling: prefs.smoothScrolling,
        enableTransitions: prefs.enableTransitions,
        emailNotifications: prefs.emailNotifications,
        pushNotifications: prefs.pushNotifications,
        notificationSound: prefs.notificationSound,
        dailyDigest: prefs.dailyDigest,
        dataCache: prefs.dataCache,
        chatEnabled: prefs.chatEnabled,
        chatPosition: prefs.chatPosition,
        dashboardLayout: prefs.dashboardLayout,
        itemsPerPage: prefs.itemsPerPage,
        showWelcome: prefs.showWelcome,
      }
    });
  } catch {
    return NextResponse.json({ error: "Failed to load preferences" }, { status: 500 });
  }
}
