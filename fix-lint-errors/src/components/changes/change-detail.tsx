"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { GitBranch, ArrowLeft, Shield, CheckCircle2, XCircle, Clock, User, Calendar, FileText, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { ChangeRequest } from "@/types";

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

function getStatusColor(status: string): string {
  const colors: Record<string, string> = { "Draft": "bg-slate-50 text-slate-700 border-slate-200", "Pending Review": "bg-amber-50 text-amber-700 border-amber-200", "Approved": "bg-emerald-50 text-emerald-700 border-emerald-200", "Scheduled": "bg-sky-50 text-sky-700 border-sky-200", "In Progress": "bg-violet-50 text-violet-700 border-violet-200", "Completed": "bg-teal-50 text-teal-700 border-teal-200", "Rejected": "bg-rose-50 text-rose-700 border-rose-200", "Cancelled": "bg-gray-50 text-gray-700 border-gray-200" };
  return colors[status] || "bg-slate-50 text-slate-700 border-slate-200";
}

function getRiskColor(risk: string): string {
  const colors: Record<string, string> = { Low: "text-emerald-600 bg-emerald-50", Medium: "text-amber-600 bg-amber-50", High: "text-orange-600 bg-orange-50", Critical: "text-rose-600 bg-rose-50" };
  return colors[risk] || "text-slate-600";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ChangeDetail() {
  const { selectedItemId, setView } = useAppStore();
  const [change, setChange] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchChange = useCallback(async () => {
    if (!selectedItemId) return;
    try {
      const res = await fetch(`/api/changes`);
      if (res.ok) { const json = await res.json(); const found = json.changes?.find((c: ChangeRequest) => c.id === selectedItemId); setChange(found || null); }
    } catch (err) { console.error("Failed to fetch change:", err); }
    finally { setLoading(false); }
  }, [selectedItemId]);

  useEffect(() => { fetchChange(); }, [fetchChange]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!change) return;
    try {
      const body: Record<string, unknown> = { id: change.id, status: newStatus };
      if (newStatus === "Approved") { body.approvedByName = "Current User"; body.approvedAt = new Date().toISOString(); }
      if (newStatus === "Completed") body.completedAt = new Date().toISOString();
      const res = await fetch("/api/changes/update", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { toast.success(`Status updated to ${newStatus}`); fetchChange(); }
    } catch { toast.error("Failed to update status"); }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !change) return;
    setSubmittingComment(true);
    try {
      const res = await fetch("/api/changes/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeId: change.id, authorName: "Current User", content: comment }),
      });
      if (res.ok) { toast.success("Comment added"); setComment(""); fetchChange(); }
    } catch { toast.error("Failed to add comment"); }
    finally { setSubmittingComment(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!change) return <div className="flex flex-col items-center justify-center py-20 text-slate-400"><GitBranch className="h-12 w-12 mb-3 opacity-30" /><p className="text-[14px] font-medium">Change request not found</p></div>;

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <button onClick={() => setView("changes")} className="group flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 transition-colors"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /><span>Back to Changes</span></button>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="flex items-start justify-between">
          <div><h1 className="text-[20px] font-bold tracking-tight text-slate-900">{change.title}</h1><p className="text-[13px] text-slate-500 mt-0.5">{change.category} • {change.changeType}</p></div>
          <div className="flex items-center gap-2">
            {change.status === "Draft" && <Button size="sm" onClick={() => handleStatusUpdate("Pending Review")} className="bg-sky-600 hover:bg-sky-700">Submit for Review</Button>}
            {change.status === "Pending Review" && (<><Button size="sm" onClick={() => handleStatusUpdate("Approved")} className="bg-emerald-600 hover:bg-emerald-700"><ThumbsUp className="h-3.5 w-3.5 mr-1" />Approve</Button><Button size="sm" variant="outline" onClick={() => handleStatusUpdate("Rejected")} className="border-rose-200 text-rose-600 hover:bg-rose-50"><ThumbsDown className="h-3.5 w-3.5 mr-1" />Reject</Button></>)}
            {change.status === "Approved" && <Button size="sm" onClick={() => handleStatusUpdate("In Progress")} className="bg-violet-600 hover:bg-violet-700">Start Implementation</Button>}
            {change.status === "In Progress" && <Button size="sm" onClick={() => handleStatusUpdate("Completed")} className="bg-teal-600 hover:bg-teal-700"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Mark Complete</Button>}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Status", value: change.status, icon: Shield, color: getStatusColor(change.status) },
            { label: "Risk Level", value: change.riskLevel, icon: Shield, color: getRiskColor(change.riskLevel) },
            { label: "Priority", value: change.priority, icon: Shield, color: "text-slate-700" },
            { label: "Requested By", value: change.requestedByName, icon: User, color: "text-slate-700" },
          ].map((stat) => (
            <Card key={stat.label} className="border-slate-200/70 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50"><stat.icon className="h-5 w-5 text-slate-500" /></div><div><p className={cn("text-[14px] font-semibold", stat.color)}>{stat.value}</p><p className="text-[11px] text-slate-500">{stat.label}</p></div></CardContent></Card>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div className="lg:col-span-2 space-y-5" variants={containerVariants}>
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="border-slate-200/70 shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-[15px] font-semibold">Description</CardTitle></CardHeader><CardContent><p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">{change.description}</p></CardContent></Card>
          </motion.div>
          {change.reason && <motion.div variants={itemVariants} viewport={{ once: true }}><Card className="border-slate-200/70 shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-[15px] font-semibold">Reason / Justification</CardTitle></CardHeader><CardContent><p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">{change.reason}</p></CardContent></Card></motion.div>}
          {change.implementationPlan && <motion.div variants={itemVariants} viewport={{ once: true }}><Card className="border-slate-200/70 shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-[15px] font-semibold">Implementation Plan</CardTitle></CardHeader><CardContent><p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">{change.implementationPlan}</p></CardContent></Card></motion.div>}
          {change.rollbackPlan && <motion.div variants={itemVariants} viewport={{ once: true }}><Card className="border-slate-200/70 shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-[15px] font-semibold">Rollback Plan</CardTitle></CardHeader><CardContent><p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">{change.rollbackPlan}</p></CardContent></Card></motion.div>}

          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="border-slate-200/70 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-[15px] font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4" />Comments ({change.comments?.length || 0})</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[300px] mb-4">
                  <div className="space-y-3">
                    {change.comments?.map((c) => {
                      const initials = (c.authorName || "?").split(" ").map((n) => n[0]).join("");
                      return (
                        <div key={c.id} className="flex gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-700 shrink-0">{initials}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium text-slate-900">{c.authorName}</span>
                              <span className="text-[11px] text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-[13px] text-slate-600 mt-1">{c.content}</p>
                          </div>
                        </div>
                      );
                    })}
                    {(!change.comments || change.comments.length === 0) && <p className="text-[13px] text-slate-400 text-center py-4">No comments yet</p>}
                  </div>
                </ScrollArea>
                <div className="flex gap-2"><Textarea placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} className="text-[13px] border-slate-200 min-h-[60px]" /><Button onClick={handleAddComment} disabled={submittingComment || !comment.trim()} className="shrink-0 bg-violet-600 hover:bg-violet-700">{submittingComment ? "..." : "Send"}</Button></div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="border-slate-200/70 shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-[15px] font-semibold">Details</CardTitle></CardHeader><CardContent className="space-y-4">
            {[
              { label: "Change Type", value: change.changeType },
              { label: "Category", value: change.category },
              { label: "Requested By", value: change.requestedByName || "—" },
              { label: "Approved By", value: change.approvedByName || "—" },
              { label: "Affected Assets", value: change.affectedAssets || "—" },
              { label: "Created", value: formatDate(change.createdAt) },
              { label: "Scheduled Start", value: formatDate(change.scheduledStart) },
              { label: "Scheduled End", value: formatDate(change.scheduledEnd) },
              { label: "Completed", value: formatDate(change.completedAt) },
            ].map((item) => (
              <div key={item.label}><p className="text-[11px] text-slate-500 uppercase tracking-wider">{item.label}</p><p className="text-[13px] text-slate-900 mt-0.5">{item.value}</p></div>
            ))}
          </CardContent></Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
