"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft, Users, Calendar, DollarSign, Shield, FileText, Pencil, Trash2, UserPlus, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { SoftwareLicense, Staff } from "@/types";

const licenseEditSchema = z.object({ name: z.string().min(2), vendor: z.string().min(1), licenseKey: z.string().optional(), licenseType: z.string().min(1), totalSeats: z.number().int().min(1), usedSeats: z.number().int().min(0).optional(), purchaseDate: z.string().optional(), expiryDate: z.string().optional(), autoRenew: z.boolean().optional(), cost: z.union([z.number().positive(), z.literal("")]).optional(), status: z.string().min(1), category: z.string().min(1), assignedTo: z.string().optional(), notes: z.string().optional() });
type LicenseEditValues = z.infer<typeof licenseEditSchema>;

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

function getStatusColor(status: string): string {
  const colors: Record<string, string> = { Active: "bg-emerald-50 text-emerald-700 border-emerald-200", Expired: "bg-rose-50 text-rose-700 border-rose-200", Suspended: "bg-amber-50 text-amber-700 border-amber-200", Pending: "bg-sky-50 text-sky-700 border-sky-200" };
  return colors[status] || "bg-slate-50 text-slate-700 border-slate-200";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const assignFormSchema = z.object({ staffId: z.string().min(1, "Staff member is required"), notes: z.string().optional() });
type AssignFormValues = z.infer<typeof assignFormSchema>;

export function LicenseDetail() {
  const { selectedItemId, setView } = useAppStore();
  const [license, setLicense] = useState<SoftwareLicense | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [staffListLoading, setStaffListLoading] = useState(true);

  const form = useForm<LicenseEditValues>({ resolver: zodResolver(licenseEditSchema), defaultValues: { name: "", vendor: "", licenseKey: "", licenseType: "Perpetual", totalSeats: 1, usedSeats: 0, purchaseDate: "", expiryDate: "", autoRenew: false, cost: "", status: "Active", category: "Software", assignedTo: "", notes: "" } });

  const assignForm = useForm<AssignFormValues>({ resolver: zodResolver(assignFormSchema), defaultValues: { staffId: "", notes: "" } });

  const fetchLicense = useCallback(async () => {
    if (!selectedItemId) return;
    try {
      const res = await fetch("/api/licenses");
      if (res.ok) { const json = await res.json(); const found = json.licenses?.find((l: SoftwareLicense) => l.id === selectedItemId); setLicense(found || null); }
    } catch (err) { console.error("Failed to fetch license:", err); }
    finally { setLoading(false); }
  }, [selectedItemId]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) { const json = await res.json(); setStaff(json.staff || []); }
    } catch { console.error("Failed to fetch staff"); }
    finally { setStaffListLoading(false); }
  }, []);

  useEffect(() => { fetchLicense(); fetchStaff(); }, [fetchLicense, fetchStaff]);

  const onSubmit = async (values: LicenseEditValues) => {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { id: license?.id, name: values.name, vendor: values.vendor, licenseKey: values.licenseKey || "", licenseType: values.licenseType, totalSeats: values.totalSeats, usedSeats: values.usedSeats || 0, status: values.status, category: values.category };
      if (values.purchaseDate) body.purchaseDate = values.purchaseDate;
      if (values.expiryDate) body.expiryDate = values.expiryDate;
      if (values.autoRenew !== undefined) body.autoRenew = values.autoRenew;
      if (typeof values.cost === "number") body.cost = values.cost;
      if (values.assignedTo) body.assignedTo = values.assignedTo;
      if (values.notes) body.notes = values.notes;
      const res = await fetch("/api/licenses/update", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { toast.success("License updated"); setDialogOpen(false); fetchLicense(); }
    } catch { toast.error("Failed to update license"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!license || !confirm("Delete this license?")) return;
    try {
      const res = await fetch("/api/licenses/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: license.id }) });
      if (res.ok) { toast.success("License deleted"); setView("licenses"); }
    } catch { toast.error("Failed to delete license"); }
  };

  const handleAssign = async (values: AssignFormValues) => {
    if (!license) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/licenses/update", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: license.id, usedSeats: (license.usedSeats || 0) + 1, assignedTo: values.staffId }) });
      if (res.ok) { toast.success("License assigned"); setAssignDialogOpen(false); assignForm.reset(); fetchLicense(); }
    } catch { toast.error("Failed to assign license"); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!license) return <div className="flex flex-col items-center justify-center py-20 text-slate-400"><KeyRound className="h-12 w-12 mb-3 opacity-30" /><p className="text-[14px] font-medium">License not found</p></div>;

  const seatUtilization = license.totalSeats > 0 ? Math.round((license.usedSeats / license.totalSeats) * 100) : 0;
  const seatColor = seatUtilization >= 90 ? "bg-rose-500" : seatUtilization >= 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <button onClick={() => setView("licenses")} className="group flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 transition-colors"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /><span>Back to Licenses</span></button>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="flex items-start justify-between">
          <div><h1 className="text-[20px] font-bold tracking-tight text-slate-900">{license.name}</h1><p className="text-[13px] text-slate-500 mt-0.5">{license.vendor} &middot; {license.licenseType}</p></div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => { form.reset({ name: license.name, vendor: license.vendor, licenseKey: license.licenseKey, licenseType: license.licenseType, totalSeats: license.totalSeats, usedSeats: license.usedSeats, purchaseDate: license.purchaseDate || "", expiryDate: license.expiryDate || "", autoRenew: license.autoRenew, cost: license.cost || "", status: license.status, category: license.category, assignedTo: license.assignedTo, notes: license.notes }); setDialogOpen(true); }} className="gap-2"><Pencil className="h-3.5 w-3.5" />Edit</Button>
            <Button size="sm" variant="destructive" onClick={handleDelete} className="gap-2"><Trash2 className="h-3.5 w-3.5" />Delete</Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Status", value: license.status, icon: Shield, color: getStatusColor(license.status) },
            { label: "Seats Used", value: `${license.usedSeats}/${license.totalSeats}`, icon: Users, color: "text-slate-700" },
            { label: "Expiry", value: formatDate(license.expiryDate), icon: Calendar, color: "text-slate-700" },
            { label: "Cost", value: license.cost ? `$${license.cost.toLocaleString()}` : "N/A", icon: DollarSign, color: "text-slate-700" },
          ].map((stat) => (
            <Card key={stat.label} className="border-slate-200/70 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50"><stat.icon className="h-5 w-5 text-slate-500" /></div><div><p className={cn("text-[14px] font-semibold", stat.color)}>{stat.value}</p><p className="text-[11px] text-slate-500">{stat.label}</p></div></CardContent></Card>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div className="lg:col-span-2 space-y-5" variants={containerVariants}>
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="border-slate-200/70 shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-[15px] font-semibold">Seat Utilization</CardTitle></CardHeader><CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[13px]"><span className="text-slate-600">{license.usedSeats} of {license.totalSeats} seats used</span><span className="font-semibold text-slate-900">{seatUtilization}%</span></div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className={cn("h-full rounded-full transition-all", seatColor)} style={{ width: `${seatUtilization}%` }} /></div>
                <div className="flex items-center justify-between text-[12px] text-slate-500"><span>{license.totalSeats - license.usedSeats} seats available</span><span>{license.autoRenew ? "Auto-renew enabled" : "Manual renewal"}</span></div>
              </div>
            </CardContent></Card>
          </motion.div>

          {license.notes && <motion.div variants={itemVariants} viewport={{ once: true }}><Card className="border-slate-200/70 shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-[15px] font-semibold">Notes</CardTitle></CardHeader><CardContent><p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">{license.notes}</p></CardContent></Card></motion.div>}

          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="border-slate-200/70 shadow-sm"><CardHeader className="pb-3 flex flex-row items-center justify-between"><CardTitle className="text-[15px] font-semibold">License Key</CardTitle><Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(license.licenseKey); toast.success("License key copied"); }}>Copy</Button></CardHeader><CardContent><code className="text-[14px] font-mono bg-slate-50 px-3 py-2 rounded-lg block break-all">{license.licenseKey || "No key stored"}</code></CardContent></Card>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="border-slate-200/70 shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-[15px] font-semibold">Details</CardTitle></CardHeader><CardContent className="space-y-4">
            {[
              { label: "Category", value: license.category },
              { label: "License Type", value: license.licenseType },
              { label: "Purchase Date", value: formatDate(license.purchaseDate) },
              { label: "Expiry Date", value: formatDate(license.expiryDate) },
              { label: "Auto Renew", value: license.autoRenew ? "Yes" : "No" },
              { label: "Assigned To", value: license.assignedTo || "Unassigned" },
              { label: "Created", value: formatDate(license.createdAt) },
              { label: "Last Updated", value: formatDate(license.updatedAt) },
            ].map((item) => (
              <div key={item.label}><p className="text-[11px] text-slate-500 uppercase tracking-wider">{item.label}</p><p className="text-[13px] text-slate-900 mt-0.5">{item.value}</p></div>
            ))}
            <Button size="sm" className="w-full gap-2 mt-4" onClick={() => setAssignDialogOpen(true)}><UserPlus className="h-3.5 w-3.5" />Assign Seat</Button>
          </CardContent></Card>
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-7 py-5 rounded-t-xl"><DialogHeader><DialogTitle className="text-[18px] font-semibold text-white flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm"><KeyRound className="h-5 w-5 text-white" /></div>Edit License</DialogTitle></DialogHeader></div>
          <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="px-7 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Name <span className="text-rose-400">*</span></FormLabel><FormControl><Input className="h-11 text-[14px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[12px]" /></FormItem>)} />
              <FormField control={form.control} name="vendor" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Vendor <span className="text-rose-400">*</span></FormLabel><FormControl><Input className="h-11 text-[14px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[12px]" /></FormItem>)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="licenseType" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 text-[14px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Perpetual">Perpetual</SelectItem><SelectItem value="Subscription">Subscription</SelectItem><SelectItem value="Concurrent">Concurrent</SelectItem><SelectItem value="Named User">Named User</SelectItem></SelectContent></Select><FormMessage className="text-[12px]" /></FormItem>)} />
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 text-[14px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Expired">Expired</SelectItem><SelectItem value="Suspended">Suspended</SelectItem></SelectContent></Select><FormMessage className="text-[12px]" /></FormItem>)} />
              <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 text-[14px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Operating System">OS</SelectItem><SelectItem value="Productivity">Productivity</SelectItem><SelectItem value="Development">Development</SelectItem><SelectItem value="Security">Security</SelectItem><SelectItem value="Software">Software</SelectItem></SelectContent></Select><FormMessage className="text-[12px]" /></FormItem>)} />
            </div>
            <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">{submitting ? "Saving..." : "Save Changes"}</Button></div>
          </form></Form>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle className="text-[16px] font-semibold">Assign License Seat</DialogTitle><DialogDescription className="text-[13px]">Assign a seat to a staff member</DialogDescription></DialogHeader>
        <Form {...assignForm}><form onSubmit={assignForm.handleSubmit(handleAssign)} className="space-y-4">
          <FormField control={assignForm.control} name="staffId" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Staff Member</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 text-[14px] border-slate-200"><SelectValue placeholder="Select staff" /></SelectTrigger></FormControl><SelectContent>{staffListLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> : staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>)}</SelectContent></Select><FormMessage className="text-[12px]" /></FormItem>)} />
          <FormField control={assignForm.control} name="notes" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Notes</FormLabel><FormControl><Textarea className="text-[14px] border-slate-200 min-h-[60px]" {...field} /></FormControl><FormMessage className="text-[12px]" /></FormItem>)} />
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">{submitting ? "Assigning..." : "Assign Seat"}</Button></div>
        </form></Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
