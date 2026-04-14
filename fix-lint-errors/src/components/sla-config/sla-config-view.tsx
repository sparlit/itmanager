"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings, Plus, Search, CheckCircle2, XCircle, Clock, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StandardWindow } from "@/components/ui/standard-window";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SLAPolicy } from "@/types";

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

const slaFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  priority: z.string().min(1, "Priority is required"),
  responseTime: z.number().int().min(1, "Must be at least 1 minute"),
  resolutionTime: z.number().int().min(1, "Must be at least 1 minute"),
  escalationTime: z.number().int().min(1, "Must be at least 1 minute"),
  isActive: z.boolean().optional(),
});

type SLAFormValues = z.infer<typeof slaFormSchema>;

function formatMinutes(mins: number): string {
  if (mins >= 1440) return `${Math.round(mins / 1440)}d`;
  if (mins >= 60) return `${Math.round(mins / 60)}h ${mins % 60}m`;
  return `${mins}m`;
}

export function SLAConfigView() {
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<SLAPolicy | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<SLAFormValues>({ resolver: zodResolver(slaFormSchema), defaultValues: { name: "", description: "", category: "All", priority: "All", responseTime: 60, resolutionTime: 480, escalationTime: 240, isActive: true } });

  const fetchPolicies = useCallback(async () => {
    try { const res = await fetch("/api/sla-policies"); if (res.ok) { const json = await res.json(); setPolicies(json.policies || []); } }
    catch (err) { console.error("Failed to fetch SLA policies:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);

  const onSubmit = async (values: SLAFormValues) => {
    setSubmitting(true);
    try {
      const url = editingPolicy ? "/api/sla-policies" : "/api/sla-policies";
      const method = editingPolicy ? "PUT" : "POST";
      const body = editingPolicy ? { id: editingPolicy.id, ...values } : values;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { toast.success(editingPolicy ? "Policy updated" : "Policy created"); setDialogOpen(false); setEditingPolicy(null); form.reset(); fetchPolicies(); }
    } catch { toast.error("Failed to save policy"); }
    finally { setSubmitting(false); }
  };

  const toggleActive = async (policy: SLAPolicy) => {
    try {
      const res = await fetch("/api/sla-policies", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: policy.id, isActive: !policy.isActive }) });
      if (res.ok) fetchPolicies();
    } catch { toast.error("Failed to update policy"); }
  };

  const filteredPolicies = policies.filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="flex items-center justify-end"><Button onClick={() => { setEditingPolicy(null); form.reset(); setDialogOpen(true); }} className="gap-2 h-10 px-5 bg-gradient-to-r from-amber-600 to-amber-700"><Plus className="h-4 w-4" />New Policy</Button></div>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-4"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search policies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 text-[13px] border-slate-200" /></div></CardContent></Card>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-0"><div className="overflow-x-auto">
          {loading ? (<div className="flex items-center justify-center py-16"><div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>)
            : filteredPolicies.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><Settings className="h-12 w-12 mb-3 opacity-30" /><p className="text-[14px] font-medium">No SLA policies</p></div>)
            : (<Table><TableHeader><TableRow className="border-slate-200/70"><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Policy</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Category</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Priority</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Response</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Resolution</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Escalation</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Status</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 w-[50px]" /></TableRow></TableHeader><TableBody>
              {filteredPolicies.map((policy) => (
                <TableRow key={policy.id} className="border-slate-100">
                  <TableCell><div><p className="text-[13px] font-medium text-slate-900">{policy.name}</p><p className="text-[11px] text-slate-500 truncate max-w-[200px]">{policy.description}</p></div></TableCell>
                  <TableCell><Badge variant="outline" className="text-[11px]">{policy.category}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-[11px]">{policy.priority}</Badge></TableCell>
                  <TableCell className="text-[13px] font-mono text-slate-700">{formatMinutes(policy.responseTime)}</TableCell>
                  <TableCell className="text-[13px] font-mono text-slate-700">{formatMinutes(policy.resolutionTime)}</TableCell>
                  <TableCell className="text-[13px] font-mono text-slate-700">{formatMinutes(policy.escalationTime)}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><Switch checked={policy.isActive} onCheckedChange={() => toggleActive(policy)} /><Badge className={cn("text-[11px]", policy.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200")}>{policy.isActive ? "Active" : "Inactive"}</Badge></div></TableCell>
                  <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => { setEditingPolicy(policy); form.reset({ name: policy.name, description: policy.description, category: policy.category, priority: policy.priority, responseTime: policy.responseTime, resolutionTime: policy.resolutionTime, escalationTime: policy.escalationTime, isActive: policy.isActive }); setDialogOpen(true); }}><Pencil className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem><DropdownMenuItem className="text-rose-600" onClick={async () => { if (!confirm("Delete this SLA policy?")) return; try { const res = await fetch("/api/sla-policies/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: policy.id }) }); if (res.ok) { toast.success("Policy deleted"); fetchPolicies(); } } catch { toast.error("Failed to delete policy"); } }}><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>)}  </div></CardContent></Card>
      </motion.div>

      <StandardWindow
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingPolicy(null); }}
        title={editingPolicy ? "Edit SLA Policy" : "New SLA Policy"}
        description="Configure response, resolution, and escalation time targets."
        icon={<Settings className="h-4 w-4 text-white" />}
        headerGradient="from-amber-600 to-amber-700"
        onSave={form.handleSubmit(onSubmit)}
        onAdd={() => { form.reset(); setEditingPolicy(null); }}
        saving={submitting}
        saveLabel="Save"
        saveIcon={<Settings className="h-3.5 w-3.5" />}
        statusMessages={[
          `${policies.length} total policies`,
          `${policies.filter((p) => p.isActive).length} active`,
          `${policies.filter((p) => !p.isActive).length} inactive`,
        ]}
        defaultWidth={650}
        defaultHeight={550}
      >
        <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Policy Name <span className="text-rose-400">*</span></FormLabel><FormControl><Input placeholder="e.g. Standard IT Support SLA" className="h-9 text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
          <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Description</FormLabel><FormControl><Textarea placeholder="Describe this SLA policy" className="text-[13px] border-slate-200 min-h-[50px]" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Category</FormLabel><FormControl><Input placeholder="e.g. All, Network" className="h-9 text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            <FormField control={form.control} name="priority" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Priority</FormLabel><FormControl><Input placeholder="e.g. All, High" className="h-9 text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField control={form.control} name="responseTime" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Response (min)</FormLabel><FormControl><Input type="number" min={1} className="h-9 text-[13px] border-slate-200" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            <FormField control={form.control} name="resolutionTime" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Resolution (min)</FormLabel><FormControl><Input type="number" min={1} className="h-9 text-[13px] border-slate-200" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            <FormField control={form.control} name="escalationTime" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Escalation (min)</FormLabel><FormControl><Input type="number" min={1} className="h-9 text-[13px] border-slate-200" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
          </div>
        </form></Form>
      </StandardWindow>
    </motion.div>
  );
}
