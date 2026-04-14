"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, Shield, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 }
};

export function ProfileSettingsView() {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "System Administrator",
    email: "admin@itmanager.local",
    phone: "+1-555-0100",
    department: "IT Management",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    ticketUpdates: true,
    systemAlerts: true,
    weeklyDigest: false,
  });

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          department: profile.department,
        }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to update profile");
      }
    } catch {
      toast.error("Failed to update profile");
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      if (res.ok) {
        toast.success("Password changed successfully");
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password");
    }
    setSaving(false);
  };

  const handleNotificationSave = async () => {
    toast.success("Notification preferences saved");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-emerald-600" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-[12px]">
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[13px]">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="h-10 text-[13px] border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="h-10 text-[13px] border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[13px]">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="h-10 text-[13px] border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-[13px]">Department</Label>
                <Input
                  id="department"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="h-10 text-[13px] border-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleProfileSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-violet-600" />
              Change Password
            </CardTitle>
            <CardDescription className="text-[12px]">
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current" className="text-[13px]">Current Password</Label>
                <Input
                  id="current"
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="h-10 text-[13px] border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new" className="text-[13px]">New Password</Label>
                <Input
                  id="new"
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="h-10 text-[13px] border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-[13px]">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="h-10 text-[13px] border-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handlePasswordChange} disabled={saving || !passwords.current || !passwords.new} className="bg-violet-600 hover:bg-violet-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-amber-600" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-[12px]">
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { key: "emailAlerts", label: "Email Alerts", desc: "Receive alerts via email" },
                { key: "ticketUpdates", label: "Ticket Updates", desc: "Get notified on ticket changes" },
                { key: "systemAlerts", label: "System Alerts", desc: "Important system notifications" },
                { key: "weeklyDigest", label: "Weekly Digest", desc: "Weekly summary of activities" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] font-medium text-slate-700">{item.label}</p>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                    className={`relative h-6 w-11 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? "bg-emerald-500" : "bg-slate-200"}`}
                  >
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? "left-6" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-end pt-2">
              <Button onClick={handleNotificationSave} className="bg-amber-600 hover:bg-amber-700">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
