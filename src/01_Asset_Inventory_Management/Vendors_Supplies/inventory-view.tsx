"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus, Search, Filter, Package, ArrowDownCircle, ArrowUpCircle,
  AlertTriangle, TrendingUp, DollarSign, Download, Trash2, Pencil,
  MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown, X, Check, Warehouse, BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StandardWindow } from "@/components/ui/standard-window";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { InventoryItem } from "@/types";
import { TransactionEntryDialog } from "@/components/inventory/transaction-entry-dialog";

const CATEGORIES = ["Cables", "Connectors", "Peripherals", "Storage", "Network", "Power", "Tools", "Consumables", "Hardware", "Software", "Other"];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } } };

const itemSchema = z.object({
  name: z.string().min(2, "Name required"),
  category: z.string().min(1, "Category required"),
  sku: z.string().min(1, "SKU required"),
  barcode: z.string().optional(),
  quantity: z.number().int().min(0),
  minStockLevel: z.number().int().min(0),
  maxStockLevel: z.number().int().min(0).optional(),
  reorderQty: z.number().int().min(0).optional(),
  unitPrice: z.union([z.number().positive(), z.literal("")]).optional(),
  unitCost: z.union([z.number().positive(), z.literal("")]).optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
  binLocation: z.string().optional(),
  notes: z.string().optional(),
});
type ItemFormValues = z.infer<typeof itemSchema>;

function stockStatus(item: InventoryItem): { label: string; color: string; bg: string } {
  if (item.quantity <= 0) return { label: "Out of Stock", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" };
  if (item.quantity <= item.minStockLevel) return { label: "Low Stock", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
  if (item.maxStockLevel && item.quantity >= item.maxStockLevel) return { label: "Overstocked", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" };
  return { label: "In Stock", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
}

function formatCurrency(n: number | null): string { return n ? `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"; }

export function InventoryView() {
  const { setView } = useAppStore();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [txnOpen, setTxnOpen] = useState(false);
  const [txnPreItem, setTxnPreItem] = useState<InventoryItem | null>(null);
  const [txnPreType, setTxnPreType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Pagination & sorting
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(25);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lowStock, setLowStock] = useState(false);

  // Stats
  const [totalValue, setTotalValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: "", category: "Cables", sku: "", barcode: "", quantity: 0, minStockLevel: 5, maxStockLevel: undefined, reorderQty: undefined, unitPrice: "", unitCost: "", supplier: "", location: "", binLocation: "", notes: "" },
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: String(limit), sortBy, sortOrder });
      if (category !== "All") p.set("category", category);
      if (search) p.set("search", search);
      if (lowStock) p.set("lowStock", "true");
      const res = await fetch(`/api/inventory?${p}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.items || []);
        setTotal(json.total || 0);
        setTotalValue(json.totalValue || 0);
        setLowStockCount(json.lowStockCount || 0);
      }
    } catch { toast.error("Failed to load inventory"); }
    finally { setLoading(false); }
  }, [page, limit, sortBy, sortOrder, category, search, lowStock]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const totalPages = Math.ceil(total / limit);

  const handleSort = (col: string) => {
    if (sortBy === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortOrder("asc"); }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ArrowUpDown className="h-3 w-3 text-slate-300" />;
    return sortOrder === "asc" ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />;
  };

  const onSubmit = async (values: ItemFormValues) => {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        name: values.name, category: values.category, sku: values.sku.toUpperCase(),
        quantity: values.quantity, minStockLevel: values.minStockLevel,
      };
      if (values.barcode) body.barcode = values.barcode;
      if (values.maxStockLevel) body.maxStockLevel = values.maxStockLevel;
      if (values.reorderQty) body.reorderQty = values.reorderQty;
      if (typeof values.unitPrice === "number") body.unitPrice = values.unitPrice;
      if (typeof values.unitCost === "number") body.unitCost = values.unitCost;
      if (values.supplier) body.supplier = values.supplier;
      if (values.location) body.location = values.location;
      if (values.binLocation) body.binLocation = values.binLocation;
      if (values.notes) body.notes = values.notes;

      const res = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        toast.success(editingItem ? "Item updated" : "Item added");
        setAddOpen(false); setEditingItem(null); form.reset(); fetchItems();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save item");
      }
    } catch { toast.error("Failed to save item"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/inventory/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Item deleted"); fetchItems(); }
      else toast.error("Failed to delete");
    } catch { toast.error("Failed to delete"); }
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export?type=inventory");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "inventory.csv";
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        toast.success("Export downloaded");
      }
    } catch { toast.error("Export failed"); }
  };

  const openTxn = (item?: InventoryItem, type?: string) => {
    setTxnPreItem(item || null);
    setTxnPreType(type || null);
    setTxnOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name, category: item.category, sku: item.sku, barcode: item.barcode || "",
      quantity: item.quantity, minStockLevel: item.minStockLevel,
      maxStockLevel: undefined, reorderQty: undefined,
      unitPrice: item.unitPrice || "", unitCost: "",
      supplier: item.supplier || "", location: item.location || "",
      binLocation: "", notes: item.notes || "",
    });
    setAddOpen(true);
  };

  const inStock = items.filter((i) => i.quantity > 0).length;
  const outOfStock = items.filter((i) => i.quantity <= 0).length;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Inventory Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track stock levels, movements, and valuations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5 h-9"><Download className="h-3.5 w-3.5" />Export</Button>
            <Button onClick={() => openTxn()} className="gap-1.5 h-9 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700"><ArrowUpDown className="h-3.5 w-3.5" />Transaction</Button>
            <Button onClick={() => { setEditingItem(null); form.reset(); setAddOpen(true); }} className="gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700"><Plus className="h-3.5 w-3.5" />Add Item</Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Total Items", value: total, icon: Package, color: "text-slate-700", bg: "bg-slate-50" },
            { label: "Total Stock", value: totalQty.toLocaleString(), icon: Warehouse, color: "text-sky-700", bg: "bg-sky-50" },
            { label: "Stock Value", value: formatCurrency(totalValue), icon: DollarSign, color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Low Stock", value: lowStockCount, icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Out of Stock", value: outOfStock, icon: TrendingUp, color: "text-rose-700", bg: "bg-rose-50" },
          ].map((s) => (
            <Card key={s.label} className="border-slate-200/60 shadow-sm"><CardContent className="p-3.5 flex items-center gap-3">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl shrink-0", s.bg)}><s.icon className={cn("h-4 w-4", s.color)} /></div>
              <div className="min-w-0"><p className="text-lg font-bold text-slate-900 leading-tight">{s.value}</p><p className="text-[11px] text-slate-500 truncate">{s.label}</p></div>
            </CardContent></Card>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/60 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input placeholder="Search items, SKU, supplier..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-8 h-8 text-[13px] border-slate-200" />
                {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="h-3 w-3 text-slate-400 hover:text-slate-600" /></button>}
              </div>
              <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
                <SelectTrigger className="w-[140px] h-8 text-[13px] border-slate-200"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent><SelectItem value="All">All Categories</SelectItem>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex items-center gap-2 px-2">
                <Switch checked={lowStock} onCheckedChange={(v) => { setLowStock(v); setPage(1); }} id="lowStock" />
                <label htmlFor="lowStock" className="text-[12px] text-slate-600 cursor-pointer select-none">Low Stock Only</label>
              </div>
              {(search || category !== "All" || lowStock) && (
                <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setCategory("All"); setLowStock(false); setPage(1); }} className="h-7 text-[11px] gap-1"><X className="h-3 w-3" />Clear</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="border-slate-200/60 shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16"><div className="h-6 w-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : !items.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Package className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">No inventory items</p>
                <p className="text-xs mt-1">Add your first item to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 bg-slate-50/50">
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-semibold text-slate-500 cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort("name")}>
                        <div className="flex items-center gap-1">Item <SortIcon col="name" /></div>
                      </TableHead>
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-semibold text-slate-500 cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort("sku")}>
                        <div className="flex items-center gap-1">SKU <SortIcon col="sku" /></div>
                      </TableHead>
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-semibold text-slate-500 hidden md:table-cell">Category</TableHead>
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-semibold text-slate-500 text-right cursor-pointer select-none hover:text-slate-700" onClick={() => handleSort("quantity")}>
                        <div className="flex items-center justify-end gap-1">Stock <SortIcon col="quantity" /></div>
                      </TableHead>
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-semibold text-slate-500 text-right hidden lg:table-cell">Min Level</TableHead>
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-semibold text-slate-500 text-right hidden lg:table-cell">Unit Price</TableHead>
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-semibold text-slate-500 text-right hidden xl:table-cell">Value</TableHead>
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 text-[11px] font-semibold text-slate-500 hidden sm:table-cell">Status</TableHead>
                      <TableHead className="border border-slate-200/60 bg-slate-50/80 w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const status = stockStatus(item);
                      const value = (item.unitPrice || 0) * item.quantity;
                      return (
                        <TableRow key={item.id} className="border-slate-50 hover:bg-slate-50/40 cursor-pointer" onClick={() => setView("inventory-detail", item.id)}>
                          <TableCell>
                            <div>
                              <p className="text-[13px] font-medium text-slate-900 truncate max-w-[200px]">{item.name}</p>
                              {item.supplier && <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{item.supplier}</p>}
                            </div>
                          </TableCell>
                          <TableCell><code className="text-[12px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{item.sku}</code></TableCell>
                          <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-[11px]">{item.category}</Badge></TableCell>
                          <TableCell className={cn("text-right text-[13px] font-semibold", item.quantity <= item.minStockLevel ? "text-rose-600" : "text-slate-900")}>{item.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-[12px] text-slate-500 hidden lg:table-cell">{item.minStockLevel}</TableCell>
                          <TableCell className="text-right text-[12px] text-slate-500 hidden lg:table-cell">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right text-[12px] font-medium text-slate-700 hidden xl:table-cell">{formatCurrency(value)}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className={cn("text-[10px] font-medium border", status.bg, status.color)}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openTxn(item, "Receipt"); }}><ArrowDownCircle className="h-3.5 w-3.5 mr-2 text-emerald-600" />Receipt</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openTxn(item, "Issue"); }}><ArrowUpCircle className="h-3.5 w-3.5 mr-2 text-rose-600" />Issue</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(item); }}><Pencil className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-rose-600" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100">
                <p className="text-[11px] text-slate-500">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft className="h-3 w-3" /></Button>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(page - 1)} disabled={page === 1}><ChevronLeft className="h-3 w-3" /></Button>
                  <span className="text-[11px] text-slate-500 px-2 min-w-[60px] text-center">Page {page} of {totalPages}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(page + 1)} disabled={page >= totalPages}><ChevronRight className="h-3 w-3" /></Button>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(totalPages)} disabled={page >= totalPages}><ChevronsRight className="h-3 w-3" /></Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Window */}
      <StandardWindow
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditingItem(null); }}
        title={editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
        description={editingItem ? "Update item details" : "Register a new stock item"}
        icon={<Package className="h-4 w-4 text-white" />}
        headerGradient="from-emerald-600 to-green-500"
        onSave={form.handleSubmit(onSubmit)}
        onAdd={() => { form.reset(); setEditingItem(null); }}
        saving={submitting}
        saveLabel="Save"
        saveIcon={<Package className="h-3.5 w-3.5" />}
        statusMessages={[
          `${items.length} total items`,
          `${items.filter((i) => i.quantity > 0).length} in stock`,
          `${items.filter((i) => i.quantity <= i.minStockLevel).length} low stock`,
          `${formatCurrency(items.reduce((s, i) => s + (i.unitPrice || 0) * i.quantity, 0))} total value`,
        ]}
        defaultWidth={800}
        defaultHeight={700}
      >
        <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Item Name <span className="text-rose-400">*</span></FormLabel><FormControl><Input className="h-9 text-[13px] border-slate-200" placeholder="e.g. Cat6 Ethernet Cable" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              <FormField control={form.control} name="sku" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">SKU <span className="text-rose-400">*</span></FormLabel><FormControl><Input className="h-9 text-[13px] font-mono border-slate-200 uppercase" placeholder="e.g. CAT6-100M" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Category <span className="text-rose-400">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-9 text-[13px] border-slate-200"><SelectValue /></SelectTrigger></FormControl><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage className="text-[11px]" /></FormItem>)} />
              <FormField control={form.control} name="barcode" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Barcode</FormLabel><FormControl><Input className="h-9 text-[13px] font-mono border-slate-200" placeholder="Scan or enter" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Opening Stock</FormLabel><FormControl><Input type="number" min={0} className="h-9 text-[13px] border-slate-200" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              <FormField control={form.control} name="minStockLevel" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Min Stock Level</FormLabel><FormControl><Input type="number" min={0} className="h-9 text-[13px] border-slate-200" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              <FormField control={form.control} name="unitPrice" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Unit Price</FormLabel><FormControl><Input type="number" min={0} step="0.01" className="h-9 text-[13px] border-slate-200" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="supplier" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Supplier</FormLabel><FormControl><Input className="h-9 text-[13px] border-slate-200" placeholder="Supplier name" {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
              <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Location</FormLabel><FormControl><Input className="h-9 text-[13px] border-slate-200" placeholder="Warehouse, Room, etc." {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel className="text-[12px] font-medium text-slate-700">Notes</FormLabel><FormControl><Textarea className="text-[13px] border-slate-200 min-h-[60px]" placeholder="Additional details..." {...field} /></FormControl><FormMessage className="text-[11px]" /></FormItem>)} />
          </div>
        </form></Form>
      </StandardWindow>

      {/* Transaction Dialog */}
      <TransactionEntryDialog open={txnOpen} onOpenChange={setTxnOpen} item={txnPreItem} items={items} preselectType={txnPreType} staff={[]} onSuccess={fetchItems} />
    </motion.div>
  );
}
