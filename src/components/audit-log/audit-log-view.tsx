"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileSearch, Search, Filter, Shield, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/types";

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

function getActionIcon(action: string) {
  if (action.includes("CREATE") || action.includes("create")) return { icon: ArrowUpRight, color: "text-emerald-600 bg-emerald-50" };
  if (action.includes("DELETE") || action.includes("delete")) return { icon: ArrowDownRight, color: "text-rose-600 bg-rose-50" };
  return { icon: Minus, color: "text-sky-600 bg-sky-50" };
}

export function AuditLogView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (entityFilter !== "All") params.set("entity", entityFilter);
      const res = await fetch(`/api/audit-log?${params.toString()}`);
      if (res.ok) { const json = await res.json(); setLogs(json.logs || []); }
    } catch (err) { console.error("Failed to fetch audit logs:", err); }
    finally { setLoading(false); }
  }, [entityFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs = logs.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (l.action || "").toLowerCase().includes(q) || (l.entity || "").toLowerCase().includes(q) || (l.userName || "").toLowerCase().includes(q) || (l.details || "").toLowerCase().includes(q);
  });

  const entities = [...new Set(logs.map((l) => l.entity).filter(Boolean))];

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50"><ArrowUpRight className="h-5 w-5 text-emerald-600" /></div><div><p className="text-[18px] font-bold text-slate-900">{logs.filter((l) => (l.action || "").includes("CREATE") || (l.action || "").includes("create")).length}</p><p className="text-[11px] text-slate-500">Created</p></div></CardContent></Card>
          <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50"><Minus className="h-5 w-5 text-sky-600" /></div><div><p className="text-[18px] font-bold text-slate-900">{logs.filter((l) => (l.action || "").includes("UPDATE") || (l.action || "").includes("update")).length}</p><p className="text-[11px] text-slate-500">Updated</p></div></CardContent></Card>
          <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50"><ArrowDownRight className="h-5 w-5 text-rose-600" /></div><div><p className="text-[18px] font-bold text-slate-900">{logs.filter((l) => (l.action || "").includes("DELETE") || (l.action || "").includes("delete")).length}</p><p className="text-[11px] text-slate-500">Deleted</p></div></CardContent></Card>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search audit log..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10 text-[13px] border-slate-200" /></div>
            <Select value={entityFilter} onValueChange={setEntityFilter}><SelectTrigger className="w-[150px] h-10 text-[13px] border-slate-200"><SelectValue placeholder="Entity" /></SelectTrigger><SelectContent><SelectItem value="All">All Entities</SelectItem>{entities.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent></Card>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/70 shadow-sm"><CardContent className="p-0"><div className="overflow-x-auto">
          {loading ? (<div className="flex items-center justify-center py-16"><div className="h-6 w-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" /></div>)
            : filteredLogs.length === 0 ? (<div className="flex flex-col items-center justify-center py-16 text-slate-400"><FileSearch className="h-12 w-12 mb-3 opacity-30" /><p className="text-[14px] font-medium">No audit logs found</p></div>)
            : (<Table><TableHeader><TableRow className="border-slate-200/70"><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Action</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Entity</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">User</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Details</TableHead><TableHead className="border border-slate-200/60 bg-slate-50/80 text-[12px] font-medium">Timestamp</TableHead></TableRow></TableHeader><TableBody>
              {filteredLogs.map((log) => {
                const { icon: ActionIcon, color } = getActionIcon(log.action);
                return (
                  <TableRow key={log.id} className="border-slate-100">
                    <TableCell><div className={cn("flex items-center gap-2 px-2 py-1 rounded-md w-fit", color)}><ActionIcon className="h-3.5 w-3.5" /><span className="text-[12px] font-medium">{log.action}</span></div></TableCell>
                    <TableCell><Badge variant="outline" className="text-[11px]">{log.entity}</Badge></TableCell>
                    <TableCell className="text-[12px] text-slate-600">{log.userName || "System"}</TableCell>
                    <TableCell className="text-[12px] text-slate-500 max-w-[300px] truncate">{log.details || "—"}</TableCell>
                    <TableCell className="text-[12px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody></Table>)}
        </div></CardContent></Card>
      </motion.div>
    </motion.div>
  );
}
