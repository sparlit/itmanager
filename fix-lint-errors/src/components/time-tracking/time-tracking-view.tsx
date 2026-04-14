"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Play, Square, Search, Filter, DollarSign, User, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StandardWindow } from "@/components/ui/standard-window";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TimeEntry } from "@/types";

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

const timeFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  staffName: z.string().min(1, "Staff name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  billable: z.boolean().optional(),
  category: z.string().min(1, "Category is required"),
});

type TimeFormValues = z.infer<typeof timeFormSchema>;

const CATEGORIES = ["Work", "Meeting", "Research", "Training", "Support", "Maintenance", "Development"];

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export function TimeTrackingView() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{ start: Date; description: string } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentUserName] = useState(() => {
    try { return localStorage.getItem("itmgr_user") || "Current User"; }
    catch { return "Current User"; }
  });

  const form = useForm<TimeFormValues>({ resolver: zodResolver(timeFormSchema), defaultValues: { description: "", staffName: "Current User", startTime: "", endTime: "", billable: false, category: "Work" } });

  const fetchEntries = useCallback(async () => {
    try { const res = await fetch("/api/time-entries"); if (res.ok) { const json = await res.json(); setEntries(json.entries || []); setTotalDuration(json.totalDuration || 0); } }
    catch (err) { console.error("Failed to fetch time entries:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  useEffect(() => {
    if (!activeTimer) return;
    const interval = setInterval(() => setElapsed((Date.now() - activeTimer.start.getTime()) / (1000 * 60 * 60)), 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const startTimer = () => {
    setActiveTimer({ start: new Date(), description: form.getValues("description") || "Untitled" });
    setElapsed(0);
  };

  const stopTimer = async () => {
    if (!activeTimer) return;
    const endTime = new Date();
    const duration = (endTime.getTime() - activeTimer.start.getTime()) / (1000 * 60 * 60);
    try {
      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: activeTimer.description, staffName: currentUserName, startTime: activeTimer.start.toISOString(), endTime: endTime.toISOString(), duration, billable: false, category: "Work" }),
      });
      if (res.ok) { toast.success("Time entry saved"); setActiveTimer(null); fetchEntries(); }
    } catch { toast.error("Failed to save time entry"); }
  };

  const onSubmit = async (values: TimeFormValues) => {
    setSubmitting(true);
    try {
      const startTime = new Date(values.startTime);
      const endTime = values.endTime ? new Date(values.endTime) : null;
      const duration = endTime ? (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) : null;
      const res = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, startTime: startTime.toISOString(), endTime: endTime?.toISOString(), duration }),
      });
      if (res.ok) { toast.success("Time entry added"); setDialogOpen(false); form.reset(); fetchEntries(); }
    } catch { toast.error("Failed to add time entry"); }
    finally { setSubmitting(false); }
  };

  const filteredEntries = entries.filter((e) => {
    if (categoryFilter !== "All" && e.category !== categoryFilter) return false;
    if (searchQuery && !(e.description || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            {activeTimer ? (
              <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[14px] font-mono font-bold">{formatDuration(elapsed)}</span>
                <Button size="sm" variant="destructive" onClick={stopTimer} className="h-8 px-3"><Square className="h-3 w-3 mr-1" />Stop</Button>
              </div>
            ) : (
              <Button onClick={startTimer} className="gap-2 h-10 px-5 bg-gradient-to-r from-emerald-600 to-emerald-700"><Play className="h-4 w-4" />Start Timer</Button>
            )}
            <Button variant="outline" onClick={() => { form.reset(); setDialogOpen(true); }} className="gap-2 h-10"><Plus className="h-4 w-4" />Manual Entry</Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50"><Clock className="h-5 w-5 text-emerald-600" /></div><div><p className="text-[18px] font-bold text-slate-900">{formatDuration(totalDuration)}</p><p className="text-[11px] text-slate-500">Total Tracked</p></div></CardContent></Card>
          <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50"><User className="h-5 w-5 text-sky-600" /></div><div><p className="text-[18px] font-bold text-slate-900">{entries.length}</p><p className="text-[11px] text-slate-500">Entries</p></div></CardContent></Card>
          <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50"><DollarSign className="h-5 w-5 text-violet-600" /></div><div><p className="text-[18px] font-bold text-slate-900">{entries.filter((e) => e.billable).length}</p><p className="text-[11px] text-slate-500">Billable</p></div></CardContent></Card>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search entries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 text-[13px] border-slate-200" /></div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-[150px] h-10 text-[13px] border-slate-200"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent><SelectItem value="All">All Categories</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent></Card>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-0"><div className="overflow-x-auto">
          {loading ? (<div className="flex items-center justify-center py-16"><div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>)
            : filteredEntries.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><Clock className="h-12 w-12 mb-3 opacity-30" /><p className="text-[14px] font-medium">No time entries</p></div>)
            : (<Table><TableHeader><TableRow className="border-slate-200/70"><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Description</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Staff</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Category</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Duration</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Date</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Billable</TableHead></TableRow></TableHeader><TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="border-slate-100">
                  <TableCell className="text-[13px] font-medium text-slate-900">{entry.description}</TableCell>
                  <TableCell className="text-[12px] text-slate-600">{entry.staffName}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[11px]">{entry.category}</Badge></TableCell>
                  <TableCell className="text-[13px] font-mono font-medium text-slate-900">{entry.duration ? formatDuration(entry.duration) : "—"}</TableCell>
                  <TableCell className="text-[12px] text-slate-600">{new Date(entry.startTime).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.billable ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px]">Yes</Badge> : <Badge variant="outline" className="text-[11px]">No</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>)}  </div></CardContent></Card>
      </motion.div>

      <StandardWindow
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Manual Time Entry"
        description="Log time manually for a task or project."
        icon={<Clock className="h-4 w-4 text-white" />}
        headerGradient="from-cyan-600 to-teal-500"
        onSave={form.handleSubmit(onSubmit)}
        onAdd={() => form.reset()}
        saving={submitting}
        saveLabel="Save"
        saveIcon={<Clock className="h-3.5 w-3.5" />}
        statusMessages={[
          `${entries.length} total entries`,
          `${formatDuration(totalDuration)} total tracked`,
          `${entries.filter((e) => e.billable).length} billable entries`,
        ]}
        defaultWidth={600}
        defaultHeight={550}
      >
        <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Description <span className="text-rose-400">*</span></FormLabel><FormControl><Textarea placeholder="What did you work on?" className="text-[13px] border-slate-200 min-h-[60px]" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Start Time <span className="text-rose-400">*</span></FormLabel><FormControl><Input type="datetime-local" className="h-9 text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">End Time</FormLabel><FormControl><Input type="datetime-local" className="h-9 text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
          </div>
          <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-9 text-[13px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage className="text-[11px]" /></FormItem>)} />
        </form></Form>
      </StandardWindow>
    </motion.div>
  );
}
