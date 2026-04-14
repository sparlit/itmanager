"use client";

import { useState, useCallback } from "react";
import { Bell, Plus, AlertTriangle, AlertCircle, Info, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  targetRoles: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  expiresAt: string | null;
}

export function AnnouncementsView() {
  const { user } = useAppStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "normal",
    targetRoles: "",
    expiresAt: "",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const isAdmin = user?.role === "admin";

  const loadAnnouncements = useCallback(async () => {
    const res = await fetch("/api/announcements");
    const data = await res.json();
    setAnnouncements(data.announcements || []);
    setIsLoaded(true);
  }, []);

  // Load on mount
  if (!isLoaded) {
    loadAnnouncements();
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
            <p className="text-sm text-muted-foreground">System-wide notifications and alerts</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const res = await fetch("/api/announcements", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          ...form,
          targetRoles: form.targetRoles || null,
          expiresAt: form.expiresAt || null,
        }),
      });

      if (res.ok) {
        toast.success(editingId ? "Announcement updated" : "Announcement created");
        setShowModal(false);
        resetForm();
        loadAnnouncements();
      } else {
        toast.error("Failed to save announcement");
      }
    } catch {
      toast.error("Failed to save announcement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;

    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Announcement deleted");
        loadAnnouncements();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setForm({ title: "", content: "", priority: "normal", targetRoles: "", expiresAt: "" });
    setEditingId(null);
  };

  const openEdit = (ann: Announcement) => {
    setForm({
      title: ann.title,
      content: ann.content,
      priority: ann.priority,
      targetRoles: ann.targetRoles || "",
      expiresAt: ann.expiresAt ? ann.expiresAt.split("T")[0] : "",
    });
    setEditingId(ann.id);
    setShowModal(true);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-500/10 text-red-400 border-red-500/20",
      warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      normal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
    return colors[priority] || colors.normal;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
          <p className="text-sm text-muted-foreground">System-wide notifications and alerts</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> New Announcement
          </Button>
        )}
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No announcements yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Card key={ann.id} className={cn("border-l-4", ann.priority === "critical" ? "border-l-red-500" : ann.priority === "warning" ? "border-l-amber-500" : "border-l-blue-500")}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getPriorityIcon(ann.priority)}
                    <CardTitle className="text-base">{ann.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityBadge(ann.priority)}>{ann.priority}</Badge>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ann)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDelete(ann.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ann.content}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>Created: {new Date(ann.createdAt).toLocaleDateString()}</span>
                  {ann.expiresAt && <span>Expires: {new Date(ann.expiresAt).toLocaleDateString()}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Announcement" : "New Announcement"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Announcement content" className="min-h-[120px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Expires At</label>
                <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Target Roles (optional)</label>
              <Input value={form.targetRoles} onChange={(e) => setForm({ ...form, targetRoles: e.target.value })} placeholder="admin,user or leave empty for all" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
