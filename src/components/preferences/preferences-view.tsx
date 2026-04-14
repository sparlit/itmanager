"use client";

import { useState, useEffect } from "react";
import { Settings, Palette, Globe, Clock, Bell, Save, Loader2, Monitor, Moon, Sun, Sidebar, Layout, Type, Maximize2, Minimize2, Eye, Zap, Database, BellRing, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 }
};

export function PreferencesView() {
  const { setShowAnimations } = useAppStore();
  const [saving, setSaving] = useState(false);
  
  const [preferences, setPreferences] = useState({
    // Language & Region
    language: "en",
    timezone: "Asia/Qatar",
    dateFormat: "DD/MM/YYYY",
    currency: "QAR",
    
    // Appearance
    theme: "light",
    compactMode: false,
    fontSize: "medium",
    sidebarStyle: "expanded",
    
    // Animations & Effects
    showAnimations: false,
    smoothScrolling: true,
    enableTransitions: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    notificationSound: true,
    dailyDigest: false,
    
    // Performance
    autoRefresh: true,
    refreshInterval: 30,
    dataCache: true,
    
    // Chat & Support
    chatEnabled: true,
    chatPosition: "bottom-right",
    
    // Dashboard
    dashboardLayout: "default",
    itemsPerPage: 20,
    showWelcome: true,
  });

  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await fetch("/api/auth/preferences");
        if (res.ok) {
          const json = await res.json();
          if (json.preferences) {
            setPreferences(prev => ({ ...prev, ...json.preferences }));
            setShowAnimations(json.preferences.showAnimations || false);
          }
        }
      } catch (e) {
        console.error("Failed to load preferences:", e);
      }
    }
    loadPrefs();
  }, [setShowAnimations]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAnimations(preferences.showAnimations);
        toast.success("Preferences saved successfully");
      } else {
        toast.error(data.error || "Failed to save preferences");
      }
    } catch {
      toast.error("Failed to save preferences");
    }
    setSaving(false);
  };

  const updatePref = (key: string, value: unknown) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Preferences</h1>
          <p className="text-sm text-muted-foreground">Customize your IT Manager experience</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Language & Regional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-600" />
            Language & Regional
          </CardTitle>
          <CardDescription>Language, currency and regional settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={preferences.language} onValueChange={(v) => updatePref("language", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (Default)</SelectItem>
                  <SelectItem value="ar">العربية (Arabic)</SelectItem>
                  <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                  <SelectItem value="tl">Filipino</SelectItem>
                  <SelectItem value="ur">اردو (Urdu)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={preferences.timezone} onValueChange={(v) => updatePref("timezone", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Qatar">Qatar (GMT+3)</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={preferences.dateFormat} onValueChange={(v) => updatePref("dateFormat", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (Qatar)</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={preferences.currency} onValueChange={(v) => updatePref("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="QAR">QAR - Qatari Riyal (ر.ق)</SelectItem>
                  <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
                  <SelectItem value="SAR">SAR - Saudi Riyal (ر.س)</SelectItem>
                  <SelectItem value="AED">AED - UAE Dirham (د.إ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-violet-600" />
            Appearance
          </CardTitle>
          <CardDescription>Look and feel settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="flex gap-3">
              {[
                { value: "light", icon: Sun, label: "Light" },
                { value: "dark", icon: Moon, label: "Dark" },
                { value: "system", icon: Monitor, label: "System" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => updatePref("theme", t.value)}
                  className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-lg border-2 transition-all ${
                    preferences.theme === t.value 
                      ? "border-violet-500 bg-violet-50 text-violet-700" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  <span className="text-sm">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Minimize2 className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Compact Mode</p>
                  <p className="text-xs text-slate-500">Smaller spacing</p>
                </div>
              </div>
              <Switch checked={preferences.compactMode} onCheckedChange={(v) => updatePref("compactMode", v)} />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Type className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Font Size</p>
                  <p className="text-xs text-slate-500">{preferences.fontSize}</p>
                </div>
              </div>
              <Select value={preferences.fontSize} onValueChange={(v) => updatePref("fontSize", v)}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Sidebar className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Sidebar</p>
                  <p className="text-xs text-slate-500">{preferences.sidebarStyle}</p>
                </div>
              </div>
              <Select value={preferences.sidebarStyle} onValueChange={(v) => updatePref("sidebarStyle", v)}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expanded">Expanded</SelectItem>
                  <SelectItem value="collapsed">Collapsed</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animations & Effects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            Animations & Effects
          </CardTitle>
          <CardDescription>Control animations and visual effects for performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Palette className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Animations</p>
                  <p className="text-xs text-slate-500">Enable UI animations</p>
                </div>
              </div>
              <Switch checked={preferences.showAnimations} onCheckedChange={(v) => updatePref("showAnimations", v)} />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Maximize2 className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Smooth Scroll</p>
                  <p className="text-xs text-slate-500">Page scrolling</p>
                </div>
              </div>
              <Switch checked={preferences.smoothScrolling} onCheckedChange={(v) => updatePref("smoothScrolling", v)} />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Transitions</p>
                  <p className="text-xs text-slate-500">Element transitions</p>
                </div>
              </div>
              <Switch checked={preferences.enableTransitions} onCheckedChange={(v) => updatePref("enableTransitions", v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-red-600" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-slate-500">Email alerts</p>
                </div>
              </div>
              <Switch checked={preferences.emailNotifications} onCheckedChange={(v) => updatePref("emailNotifications", v)} />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Push</p>
                  <p className="text-xs text-slate-500">Browser notifications</p>
                </div>
              </div>
              <Switch checked={preferences.pushNotifications} onCheckedChange={(v) => updatePref("pushNotifications", v)} />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Sound</p>
                  <p className="text-xs text-slate-500">Notification sounds</p>
                </div>
              </div>
              <Switch checked={preferences.notificationSound} onCheckedChange={(v) => updatePref("notificationSound", v)} />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Daily Digest</p>
                  <p className="text-xs text-slate-500">Daily summary</p>
                </div>
              </div>
              <Switch checked={preferences.dailyDigest} onCheckedChange={(v) => updatePref("dailyDigest", v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            Performance
          </CardTitle>
          <CardDescription>Data refresh and performance settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Auto Refresh</p>
                  <p className="text-xs text-slate-500">Live data</p>
                </div>
              </div>
              <Switch checked={preferences.autoRefresh} onCheckedChange={(v) => updatePref("autoRefresh", v)} />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Data Cache</p>
                  <p className="text-xs text-slate-500">Cache locally</p>
                </div>
              </div>
              <Switch checked={preferences.dataCache} onCheckedChange={(v) => updatePref("dataCache", v)} />
            </div>

            <div className="space-y-2">
              <Label>Refresh Interval</Label>
              <Select value={String(preferences.refreshInterval)} onValueChange={(v) => updatePref("refreshInterval", parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="0">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Chat Support
          </CardTitle>
          <CardDescription>Live chat widget settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Enable Chat</p>
                  <p className="text-xs text-slate-500">Show chat widget</p>
                </div>
              </div>
              <Switch checked={preferences.chatEnabled} onCheckedChange={(v) => updatePref("chatEnabled", v)} />
            </div>

            <div className="space-y-2">
              <Label>Chat Position</Label>
              <Select value={preferences.chatPosition} onValueChange={(v) => updatePref("chatPosition", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-orange-600" />
            Dashboard
          </CardTitle>
          <CardDescription>Dashboard display settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select value={preferences.dashboardLayout} onValueChange={(v) => updatePref("dashboardLayout", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Items Per Page</Label>
              <Select value={String(preferences.itemsPerPage)} onValueChange={(v) => updatePref("itemsPerPage", parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-sm font-medium">Welcome Screen</p>
                  <p className="text-xs text-slate-500">Show on login</p>
                </div>
              </div>
              <Switch checked={preferences.showWelcome} onCheckedChange={(v) => updatePref("showWelcome", v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save All Preferences"}
        </Button>
      </div>
    </div>
  );
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}
