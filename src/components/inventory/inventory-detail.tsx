"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Package, Tag, DollarSign, MapPin, Building2,
  ArrowDownCircle, ArrowUpCircle, SlidersHorizontal, Search, Clock,
  Pencil, Trash2, AlertTriangle, History, PackageCheck,
  ArrowRightLeft, ChevronDown, ChevronUp, X, Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { InventoryItem, InventoryTransaction } from "@/types";
import { TransactionEntryDialog } from "@/components/inventory/transaction-entry-dialog";

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

const TXN_TYPES = [
  { value: "Receipt", label: "Goods Receipt", icon: ArrowDownCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { value: "Issue", label: "Goods Issue", icon: ArrowUpCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  { value: "Transfer", label: "Transfer", icon: ArrowRightLeft, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { value: "Adjustment", label: "Adjustment", icon: SlidersHorizontal, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
];

function stockStatus(item: InventoryItem): { label: string; color: string; bg: string } {
  if (item.quantity <= 0) return { label: "Out of Stock", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" };
  if (item.quantity <= item.minStockLevel) return { label: "Low Stock", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
  return { label: "In Stock", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
}

function formatDate(d: string | null): string {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function formatDateTime(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function formatCurrency(n: number | null): string { return n ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"; }

export function InventoryDetail() {
  const { selectedItemId, setView } = useAppStore();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txnOpen, setTxnOpen] = useState(false);
  const [txnType, setTxnType] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", category: "", sku: "", barcode: "", minStockLevel: 5, unitPrice: "", supplier: "", location: "", binLocation: "", notes: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [txnFilter, setTxnFilter] = useState("All");
  const [txnSearch, setTxnSearch] = useState("");
  const [txnPage, setTxnPage] = useState(1);
  const txnPerPage = 15;

  const fetchItem = useCallback(async () => {
    if (!selectedItemId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory?search=${selectedItemId}`);
      if (res.ok) {
        const json = await res.json();
        const found = json.items?.find((i: InventoryItem) => i.id === selectedItemId);
        if (found) {
          setItem(found);
          setTransactions(found.transactions || []);
        }
      }
    } catch { toast.error("Failed to load item"); }
    finally { setLoading(false); }
  }, [selectedItemId]);

  useEffect(() => { fetchItem(); }, [fetchItem]);

  const openTxn = (type: string) => { setTxnType(type); setTxnOpen(true); };

  const openEdit = () => {
    if (!item) return;
    setEditForm({
      name: item.name, category: item.category, sku: item.sku, barcode: item.barcode || "",
      minStockLevel: item.minStockLevel, unitPrice: item.unitPrice ? String(item.unitPrice) : "",
      supplier: item.supplier || "", location: item.location || "", binLocation: "", notes: item.notes || "",
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!item) return;
    setEditSubmitting(true);
    try {
      const body: Record<string, unknown> = { id: item.id, name: editForm.name, category: editForm.category, sku: editForm.sku.toUpperCase() };
      if (editForm.barcode) body.barcode = editForm.barcode;
      if (editForm.minStockLevel) body.minStockLevel = editForm.minStockLevel;
      if (typeof editForm.unitPrice === "number" || (typeof editForm.unitPrice === "string" && editForm.unitPrice)) body.unitPrice = editForm.unitPrice ? Number(editForm.unitPrice) : null;
      if (editForm.supplier) body.supplier = editForm.supplier;
      if (editForm.location) body.location = editForm.location;
      if (editForm.notes) body.notes = editForm.notes;
      const res = await fetch("/api/inventory/update", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { toast.success("Item updated"); setEditOpen(false); fetchItem(); }
      else { const e = await res.json(); toast.error(e.error || "Failed to update"); }
    } catch { toast.error("Failed to update"); }
    finally { setEditSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!item || !confirm("Delete this item? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/inventory/delete?id=${item.id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Item deleted"); setView("inventory"); }
      else toast.error("Failed to delete");
    } catch { toast.error("Failed to delete"); }
  };

  const filteredTxns = transactions.filter((t) => {
    if (txnFilter !== "All" && t.type !== txnFilter) return false;
    if (txnSearch) {
      const q = txnSearch.toLowerCase();
      if (!t.performedBy.toLowerCase().includes(q) && !(t.notes || "").toLowerCase().includes(q) && !(t.referenceNo || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalTxnPages = Math.ceil(filteredTxns.length / txnPerPage);
  const pagedTxns = filteredTxns.slice((txnPage - 1) * txnPerPage, txnPage * txnPerPage);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!item) return <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Package className="h-12 w-12 mb-3 opacity-30" /><p className="text-sm font-medium">Item not found</p></div>;

  const status = stockStatus(item);
  const totalValue = (item.unitPrice || 0) * item.quantity;
  const totalTxns = transactions.length;
  const receipts = transactions.filter((t) => t.type === "Receipt").reduce((s, t) => s + t.quantity, 0);
  const issues = transactions.filter((t) => t.type === "Issue" || t.type === "CheckOut").reduce((s, t) => s + t.quantity, 0);

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("inventory")} className="group flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />Back</button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{item.name}</h1>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.sku}</code>
                <Badge variant="outline" className="text-[11px]">{item.category}</Badge>
                <Badge className={cn("text-[10px] font-medium border", status.bg, status.color)}>{status.label}</Badge>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openEdit} className="gap-1.5 h-8 text-[12px]"><Pencil className="h-3 w-3" />Edit</Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="gap-1.5 h-8 text-[12px] text-rose-600 border-rose-200 hover:bg-rose-50"><Trash2 className="h-3 w-3" />Delete</Button>
            <Button onClick={() => openTxn("Receipt")} className="gap-1.5 h-8 text-[12px] bg-emerald-600 hover:bg-emerald-700"><ArrowDownCircle className="h-3 w-3" />Receipt</Button>
            <Button onClick={() => openTxn("Issue")} className="gap-1.5 h-8 text-[12px] bg-rose-600 hover:bg-rose-700"><ArrowUpCircle className="h-3 w-3" />Issue</Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Current Stock", value: item.quantity.toLocaleString(), icon: Package, color: "text-slate-700", bg: "bg-slate-50" },
            { label: "Stock Value", value: formatCurrency(totalValue), icon: DollarSign, color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Total Receipts", value: `+${receipts.toLocaleString()}`, icon: ArrowDownCircle, color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Total Issues", value: `-${issues.toLocaleString()}`, icon: ArrowUpCircle, color: "text-rose-700", bg: "bg-rose-50" },
          ].map((s) => (
            <Card key={s.label} className="border-slate-200/60 shadow-sm"><CardContent className="p-3.5 flex items-center gap-3">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl shrink-0", s.bg)}><s.icon className={cn("h-4 w-4", s.color)} /></div>
              <div><p className="text-lg font-bold text-slate-900 leading-tight">{s.value}</p><p className="text-[11px] text-slate-500">{s.label}</p></div>
            </CardContent></Card>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Details */}
        <motion.div className="lg:col-span-1 space-y-5" variants={containerVariants}>
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-[14px] font-semibold">Item Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Category", value: item.category },
                  { label: "SKU", value: item.sku },
                  { label: "Barcode", value: item.barcode || "—" },
                  { label: "Supplier", value: item.supplier || "—" },
                  { label: "Location", value: item.location || "—" },
                  { label: "Min Stock Level", value: String(item.minStockLevel) },
                  { label: "Unit Price", value: formatCurrency(item.unitPrice) },
                  { label: "Last Restocked", value: formatDate(item.lastRestocked) },
                  { label: "Created", value: formatDate(item.createdAt) },
                  { label: "Last Updated", value: formatDate(item.updatedAt) },
                ].map((d) => (
                  <div key={d.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{d.label}</span>
                    <span className="text-[13px] font-medium text-slate-900">{d.value}</span>
                  </div>
                ))}
                {item.notes && (
                  <>
                    <Separator />
                    <div><span className="text-[11px] text-slate-500">Notes</span><p className="text-[12px] text-slate-700 mt-1">{item.notes}</p></div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="border-slate-200/60 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-[14px] font-semibold">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {TXN_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Button key={t.value} variant="outline" onClick={() => openTxn(t.value)} className={cn("w-full justify-start gap-2 h-9 text-[13px]", t.color)}>
                      <Icon className="h-4 w-4" />{t.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Transaction History */}
        <motion.div className="lg:col-span-2" variants={itemVariants} viewport={{ once: true }}>
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px] font-semibold flex items-center gap-2"><History className="h-4 w-4" />Transaction History ({totalTxns})</CardTitle>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                  <Input placeholder="Search transactions..." value={txnSearch} onChange={(e) => { setTxnSearch(e.target.value); setTxnPage(1); }} className="pl-7 h-8 text-[12px] border-slate-200" />
                </div>
                <Select value={txnFilter} onValueChange={(v) => { setTxnFilter(v); setTxnPage(1); }}>
                  <SelectTrigger className="w-[130px] h-8 text-[12px] border-slate-200"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    {TXN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!filteredTxns.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400"><Clock className="h-8 w-8 mb-2 opacity-30" /><p className="text-sm">No transactions found</p></div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow className="border-slate-100 bg-slate-50/50"><TableHead className="text-[10px] font-semibold text-slate-500">Date</TableHead><TableHead className="text-[10px] font-semibold text-slate-500">Type</TableHead><TableHead className="text-[10px] font-semibold text-slate-500 text-right">Qty</TableHead><TableHead className="text-[10px] font-semibold text-slate-500 hidden sm:table-cell">Ref#</TableHead><TableHead className="text-[10px] font-semibold text-slate-500 hidden md:table-cell">By</TableHead><TableHead className="text-[10px] font-semibold text-slate-500 hidden lg:table-cell">Notes</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {pagedTxns.map((t) => {
                          const typeInfo = TXN_TYPES.find((tt) => tt.value === t.type) || TXN_TYPES[0];
                          const TIcon = typeInfo.icon;
                          return (
                            <TableRow key={t.id} className="border-slate-50">
                              <TableCell className="text-[11px] text-slate-500 whitespace-nowrap">{formatDateTime(t.createdAt)}</TableCell>
                              <TableCell><div className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded w-fit", typeInfo.bg)}><TIcon className={cn("h-3 w-3", typeInfo.color)} /><span className={cn("text-[11px] font-medium", typeInfo.color)}>{t.type}</span></div></TableCell>
                              <TableCell className={cn("text-right text-[12px] font-mono font-semibold", t.type === "Receipt" ? "text-emerald-600" : "text-rose-600")}>{t.type === "Receipt" ? "+" : "-"}{t.quantity}</TableCell>
                              <TableCell className="text-[11px] text-slate-500 font-mono hidden sm:table-cell">{t.referenceNo || "—"}</TableCell>
                              <TableCell className="text-[11px] text-slate-600 hidden md:table-cell">{t.performedBy}</TableCell>
                              <TableCell className="text-[11px] text-slate-400 max-w-[150px] truncate hidden lg:table-cell">{t.notes || "—"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {totalTxnPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100">
                      <p className="text-[11px] text-slate-500">{(txnPage - 1) * txnPerPage + 1}–{Math.min(txnPage * txnPerPage, filteredTxns.length)} of {filteredTxns.length}</p>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setTxnPage(Math.max(1, txnPage - 1))} disabled={txnPage === 1}>Previous</Button>
                        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setTxnPage(Math.min(totalTxnPages, txnPage + 1))} disabled={txnPage >= totalTxnPages}>Next</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle className="text-[16px] font-semibold">Edit Item</DialogTitle><DialogDescription className="text-[13px]">Update item details. Stock changes must be made through transactions.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] font-medium text-slate-600 mb-1 block">Name</label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-9 text-[13px] border-slate-200" /></div>
            <div><label className="text-[11px] font-medium text-slate-600 mb-1 block">SKU</label><Input value={editForm.sku} onChange={(e) => setEditForm({ ...editForm, sku: e.target.value.toUpperCase() })} className="h-9 text-[13px] font-mono border-slate-200" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] font-medium text-slate-600 mb-1 block">Category</label><Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="h-9 text-[13px] border-slate-200" /></div>
            <div><label className="text-[11px] font-medium text-slate-600 mb-1 block">Barcode</label><Input value={editForm.barcode} onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })} className="h-9 text-[13px] font-mono border-slate-200" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[11px] font-medium text-slate-600 mb-1 block">Min Stock Level</label><Input type="number" min={0} value={editForm.minStockLevel} onChange={(e) => setEditForm({ ...editForm, minStockLevel: Number(e.target.value) })} className="h-9 text-[13px] border-slate-200" /></div>
            <div><label className="text-[11px] font-medium text-slate-600 mb-1 block">Unit Price</label><Input type="number" min={0} step="0.01" value={editForm.unitPrice} onChange={(e) => setEditForm({ ...editForm, unitPrice: e.target.value })} className="h-9 text-[13px] border-slate-200" /></div>
          </div>
          <div><label className="text-[11px] font-medium text-slate-600 mb-1 block">Supplier</label><Input value={editForm.supplier} onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })} className="h-9 text-[13px] border-slate-200" /></div>
          <div><label className="text-[11px] font-medium text-slate-600 mb-1 block">Location</label><Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="h-9 text-[13px] border-slate-200" /></div>
          <div><label className="text-[11px] font-medium text-slate-600 mb-1 block">Notes</label><Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="text-[13px] border-slate-200 min-h-[50px]" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={handleEdit} disabled={editSubmitting} className="bg-emerald-600 hover:bg-emerald-700">{editSubmitting ? "Saving..." : "Save Changes"}</Button></div>
      </DialogContent>
      </Dialog>

      {/* Transaction Dialog */}
      <TransactionEntryDialog open={txnOpen} onOpenChange={setTxnOpen} item={item} items={item ? [item] : []} preselectType={txnType} staff={[]} onSuccess={fetchItem} />
    </motion.div>
  );
}
