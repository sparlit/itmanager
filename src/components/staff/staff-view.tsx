"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  Users,
  Mail,
  Monitor,
  TicketCheck,
  SlidersHorizontal,
  X,
  Inbox,
  UserCircle,
  Briefcase,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StandardWindow } from "@/components/ui/standard-window";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ComboboxInput, type ComboboxOption } from "@/components/ui/combobox-input";
import { useAppStore } from "@/store/app-store";
import type { Staff } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEPARTMENT_OPTIONS = ["IT", "Engineering", "Support", "Management", "Security", "Network", "Development", "Operations"];
const ROLE_OPTIONS = ["Admin", "Manager", "Technician", "Engineer", "Analyst", "Support", "Director"];
const STATUS_OPTIONS = ["Active", "On Leave", "Inactive"];
const AVATAR_GRADIENTS = [
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-violet-400 to-purple-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-indigo-400 to-blue-500",
  "from-teal-400 to-emerald-500",
  "from-fuchsia-400 to-pink-500",
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

const staffFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  role: z.string().min(1, "Role is required"),
  status: z.string().min(1, "Status is required"),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
  Inactive: "bg-slate-50 text-slate-500 border-slate-200",
};

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function StaffView() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(-1);

  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { setView } = useAppStore();

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: { name: "", email: "", phone: "", department: "IT", role: "Support", status: "Active" },
  });

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) { const json = await res.json(); setStaffList(json.staff || []); }
    } catch { toast.error("Failed to fetch staff"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  async function onSubmit(values: StaffFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        toast.success("Staff member added successfully");
        setDialogOpen(false);
        form.reset();
        await fetchStaff();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to add staff member");
      }
    } catch { toast.error("Failed to add staff member"); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this staff member?")) return;
    try {
      const res = await fetch("/api/staff/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (res.ok) { toast.success("Staff member deleted"); fetchStaff(); }
      else toast.error("Failed to delete");
    } catch { toast.error("Failed to delete"); }
  }

  function navigateRecord(direction: "next" | "prev" | "first" | "last") {
    if (staffList.length === 0) return;
    let idx = currentRecordIndex;
    if (direction === "first") idx = 0;
    else if (direction === "last") idx = staffList.length - 1;
    else if (direction === "next") idx = Math.min(staffList.length - 1, currentRecordIndex + 1);
    else if (direction === "prev") idx = Math.max(0, currentRecordIndex - 1);
    if (idx >= 0 && idx < staffList.length) {
      const member = staffList[idx];
      setCurrentRecordIndex(idx);
      form.reset({ name: member.name, email: member.email, phone: member.phone || "", department: member.department, role: member.role, status: member.status });
    }
  }

  async function handleExport() {
    try {
      const res = await fetch("/api/export?type=staff");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const disposition = res.headers.get("Content-Disposition");
        const filename = disposition ? disposition.split("filename=")[1]?.replace(/"/g, "") : "staff-export.csv";
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Export downloaded successfully");
      }
    } catch { toast.error("Failed to export data"); }
  }

  function clearFilters() {
    setDepartmentFilter("All");
    setRoleFilter("All");
    setStatusFilter("All");
    setSearchQuery("");
  }

  const hasActiveFilters = departmentFilter !== "All" || roleFilter !== "All" || statusFilter !== "All" || searchQuery !== "";

  const filteredStaff = staffList.filter((member) => {
    if (departmentFilter !== "All" && member.department !== departmentFilter) return false;
    if (roleFilter !== "All" && member.role !== roleFilter) return false;
    if (statusFilter !== "All" && member.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return member.name.toLowerCase().includes(q) || member.email.toLowerCase().includes(q) || (member.phone || "").toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between"><div className="space-y-1.5"><div className="h-7 w-44 rounded-lg bg-slate-200 animate-pulse" /><div className="h-4 w-64 rounded-lg bg-slate-200 animate-pulse" /></div><div className="h-10 w-36 rounded-xl bg-slate-200 animate-pulse" /></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="h-48 rounded-2xl bg-slate-200 animate-pulse" />))}</div>
      </div>
    );
  }

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
      {/* ─── Page Header ───────────────────────────────────────── */}
      <motion.div className="flex items-center gap-2.5" variants={itemVariants} viewport={{ once: true }}>
        <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>
        <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-sm shadow-emerald-600/20" onClick={() => { form.reset(); setCurrentRecordIndex(-1); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Member</Button>
      </motion.div>

      {/* ─── Stats Mini-Bar ────────────────────────────────────── */}
      <motion.div className="flex flex-wrap gap-3" variants={itemVariants} viewport={{ once: true }}>
        {[
          { label: "Total Members", count: staffList.length, dot: "bg-slate-400" },
          { label: "Active", count: staffList.filter((m) => m.status === "Active").length, dot: "bg-emerald-500" },
          { label: "On Leave", count: staffList.filter((m) => m.status === "On Leave").length, dot: "bg-amber-500" },
          { label: "Departments", count: [...new Set(staffList.map((m) => m.department))].length, dot: "bg-violet-500" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3.5 py-2">
            <span className={cn("h-2 w-2 rounded-full", stat.dot)} />
            <span className="text-[12px] font-medium text-slate-600">{stat.label}</span>
            <span className="text-[13px] font-semibold text-slate-900">{stat.count}</span>
          </div>
        ))}
      </motion.div>

      {/* ─── Filter Bar ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="rounded-xl border-slate-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400 mr-1"><SlidersHorizontal className="h-4 w-4" /><span className="text-[12px] font-medium">Filters</span></div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}><SelectTrigger className="w-[148px] h-9 rounded-lg text-[13px] border-slate-200"><SelectValue placeholder="Department" /></SelectTrigger><SelectContent><SelectItem value="All">All Departments</SelectItem>{DEPARTMENT_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-[148px] h-9 rounded-lg text-[13px] border-slate-200"><SelectValue placeholder="Role" /></SelectTrigger><SelectContent><SelectItem value="All">All Roles</SelectItem>{ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px] h-9 rounded-lg text-[13px] border-slate-200"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="All">All Status</SelectItem>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 rounded-lg text-[13px] border-slate-200" />
              </div>
              {hasActiveFilters && <Button variant="ghost" size="sm" className="text-[12px] text-slate-500 hover:text-slate-700 rounded-lg" onClick={clearFilters}><X className="mr-1 h-3 w-3" />Clear filters</Button>}
              <div className="ml-auto text-[12px] font-medium text-slate-400">{filteredStaff.length} result{filteredStaff.length !== 1 ? "s" : ""}</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Staff Grid ─────────────────────────────────────────── */}
      {filteredStaff.length === 0 ? (
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60 bg-white">
            <CardContent className="p-12">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50"><Inbox className="h-8 w-8 text-slate-300" /></div>
                <div><p className="text-[14px] font-medium text-slate-600">No team members found</p><p className="text-[12px] mt-0.5">{hasActiveFilters ? "Try adjusting your filters" : "Add your first team member to get started"}</p></div>
                {hasActiveFilters && <Button variant="outline" size="sm" onClick={clearFilters} className="mt-1 text-[12px] rounded-lg">Clear Filters</Button>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" variants={containerVariants}>
          {filteredStaff.map((member) => (
            <motion.div key={member.id} variants={itemVariants} viewport={{ once: true }}>
              <Card className="group rounded-2xl border-slate-200/60 bg-white hover:shadow-md hover:border-emerald-200/60 transition-all duration-200 cursor-pointer overflow-hidden" onClick={() => setView("staff-detail", member.id)}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3.5">
                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white font-bold text-[14px]", getAvatarGradient(member.name))}>
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{member.name}</h3>
                      <Badge variant="outline" className="text-[10px] rounded-lg border font-medium mt-0.5 bg-slate-50 text-slate-600 border-slate-200">{member.role}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn("text-[10px] rounded-lg border font-medium shrink-0", STATUS_COLORS[member.status] || "")}>{member.status}</Badge>
                      <div className="relative">
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-3.5 bg-slate-100" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[12px] text-slate-500"><Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{member.email}</span></div>
                    {member.phone && <div className="flex items-center gap-2 text-[12px] text-slate-500"><Monitor className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span>{member.phone}</span></div>}
                    <div className="flex items-center gap-2 text-[12px] text-slate-500"><Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span>{member.department}</span></div>
                  </div>
                  <div className="flex items-center gap-3 mt-3.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400"><TicketCheck className="h-3 w-3" /><span>{member._count?.assignedTickets || 0} assigned</span></div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400"><UserCircle className="h-3 w-3" /><span>{member._count?.reportedTickets || 0} reported</span></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ─── Add Staff Window ───────────────────────────────────── */}
      <StandardWindow
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Add Team Member"
        description="Register a new member to the IT department. Fill in personal information and work details."
        icon={<Users className="h-4 w-4 text-white" />}
        headerGradient="from-emerald-600 to-teal-500"
        onSave={form.handleSubmit(onSubmit)}
        onAdd={() => { form.reset(); setCurrentRecordIndex(-1); }}
        onNavigate={navigateRecord}
        currentIndex={currentRecordIndex}
        totalCount={staffList.length}
        saving={submitting}
        saveLabel="Save"
        saveIcon={<Users className="h-3.5 w-3.5" />}
        statusMessages={[
          `${staffList.length} team members registered`,
          `${staffList.filter((m) => m.status === "Active").length} active members`,
          `${[...new Set(staffList.map((m) => m.department))].length} departments`,
        ]}
        defaultWidth={750}
        defaultHeight={650}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><UserCircle className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Personal Information</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem className="mb-4"><FormLabel className="text-[13px] font-medium text-slate-700">Full Name <span className="text-rose-400">*</span></FormLabel><FormControl><Input placeholder="John Doe" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem className="mb-4"><FormLabel className="text-[13px] font-medium text-slate-700">Email <span className="text-rose-400">*</span></FormLabel><FormControl><Input type="email" placeholder="john.doe@company.com" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Phone</FormLabel><FormControl><Input placeholder="+1 (555) 000-0000" className="h-10 rounded-lg text-[13px] border-slate-200" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              </div>
              <Separator />
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700"><Briefcase className="h-3.5 w-3.5" /></div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Work Details</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="department" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Department <span className="text-rose-400">*</span></FormLabel><FormControl><ComboboxInput value={field.value} onChange={field.onChange} placeholder="Select department..." options={DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: d }))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                  <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel className="text-[13px] font-medium text-slate-700">Role <span className="text-rose-400">*</span></FormLabel><FormControl><ComboboxInput value={field.value} onChange={field.onChange} placeholder="Select role..." options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
                </div>
                <FormField control={form.control} name="status" render={({ field }) => (<FormItem className="mt-4"><FormLabel className="text-[13px] font-medium text-slate-700">Status <span className="text-rose-400">*</span></FormLabel><FormControl><ComboboxInput value={field.value} onChange={field.onChange} placeholder="Select status..." options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              </div>
            </div>
          </form>
        </Form>
      </StandardWindow>
    </motion.div>
  );
}
