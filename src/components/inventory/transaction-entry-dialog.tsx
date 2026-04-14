"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownCircle, ArrowUpCircle, SlidersHorizontal, ArrowLeftRight,
  Search, X, Check, Plus, Trash2, Calendar, Clock, User, Building2,
  FileText, Package, Hash, Save, ChevronsLeft, ChevronLeft,
  ChevronRight, ChevronsRight, PanelLeftClose, PanelLeftOpen, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { InventoryItem, Staff } from "@/types";

const TXN_TYPES = [
  { value: "Receipt", label: "Goods Receipt", icon: ArrowDownCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { value: "Issue", label: "Goods Issue", icon: ArrowUpCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  { value: "Transfer", label: "Stock Transfer", icon: ArrowLeftRight, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { value: "Adjustment", label: "Stock Adjustment", icon: SlidersHorizontal, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
];

function formatNowDate(): string { return new Date().toISOString().split("T")[0]; }
function formatNowTime(): string { return new Date().toTimeString().slice(0, 5); }
function formatDateDisplay(d: string): string { if (!d) return ""; const dt = new Date(d + "T00:00:00"); return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }

interface LineItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemDescription: string;
  quantity: number;
}

interface SavedTransaction {
  id: string;
  type: string;
  date: string;
  time: string;
  referenceNo: string;
  requestedBy: string;
  department: string;
  remarks: string;
  preparedBy: string;
  authorisedBy: string;
  lineItems: LineItem[];
  createdAt: string;
}

interface InventoryTransactionHistoryRow {
  id: string;
  itemId: string;
  itemCode?: string;
  itemDescription?: string;
  quantity: number;
  type: string;
  transactionDate?: string;
  transactionTime?: string;
  referenceNo?: string;
  requestedBy?: string;
  issuedToDepartment?: string;
  notes?: string | null;
  performedBy?: string;
  authorisedBy?: string;
  createdAt: string;
}

interface TransactionEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  items: InventoryItem[];
  preselectType: string | null;
  staff: Staff[];
  onSuccess: () => void;
}

export function TransactionEntryDialog({ open, onOpenChange, item: preselectedItem, items, preselectType, staff, onSuccess }: TransactionEntryDialogProps) {
  const [txnType, setTxnType] = useState(preselectType || "Receipt");
  const [txnDate, setTxnDate] = useState(formatNowDate());
  const [txnTime, setTxnTime] = useState(formatNowTime());
  const [requestedBy, setRequestedBy] = useState("");
  const [department, setDepartment] = useState("");
  const [preparedBy, setPreparedBy] = useState(staff.length > 0 ? staff[0].name : "");
  const [authorisedBy, setAuthorisedBy] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [searchMap, setSearchMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [history, setHistory] = useState<SavedTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Panel state
  const [pos, setPos] = useState({ x: 50, y: 30 });
  const [panelSize, setPanelSize] = useState({ w: 1100, h: 700 });
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const resetForm = useCallback(() => {
    setTxnType(preselectType || "Receipt");
    setTxnDate(formatNowDate());
    setTxnTime(formatNowTime());
    setRequestedBy("");
    setDepartment("");
    setPreparedBy(staff.length > 0 ? staff[0].name : "");
    setAuthorisedBy("");
    setReferenceNo("");
    setRemarks("");
    setSearchMap({});
    setCurrentIndex(-1);
    setIsDirty(false);
    if (preselectedItem) {
      setLineItems([{ id: crypto.randomUUID(), itemId: preselectedItem.id, itemCode: preselectedItem.sku, itemDescription: preselectedItem.name, quantity: 1 }]);
      setSearchMap({ "0": `${preselectedItem.name} (${preselectedItem.sku})` });
    } else {
      setLineItems([]);
    }
  }, [preselectedItem, preselectType, staff]);

  useEffect(() => {
    if (open) {
      resetForm();
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setPanelSize({ w: window.innerWidth, h: window.innerHeight });
        setPos({ x: 0, y: 0 });
      } else {
        setPanelSize({ w: Math.max(900, Math.min(window.innerWidth * 0.9, 1400)), h: Math.max(550, Math.min(window.innerHeight * 0.85, 850)) });
        setPos({ x: Math.max(20, (window.innerWidth - 1100) / 2), y: 20 });
      }
    }
  }, [open, resetForm]);

  // Mouse handlers for drag & resize
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDragging.current) {
        setPos({ x: Math.max(0, e.clientX - dragOffset.current.x), y: Math.max(0, e.clientY - dragOffset.current.y) });
      }
      if (isResizing.current) {
        setPanelSize({
          w: Math.max(700, resizeStart.current.w + (e.clientX - resizeStart.current.x)),
          h: Math.max(400, resizeStart.current.h + (e.clientY - resizeStart.current.y)),
        });
      }
    };
    const onUp = () => { isDragging.current = false; isResizing.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, select, textarea, [data-no-drag]")) return;
    isDragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  const startResize = (e: React.MouseEvent) => {
    isResizing.current = true;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: panelSize.w, h: panelSize.h };
    e.preventDefault();
  };

  const totalQty = useMemo(() => lineItems.reduce((s, l) => s + (l.quantity || 0), 0), [lineItems]);

  const addLine = () => { setLineItems([...lineItems, { id: crypto.randomUUID(), itemId: "", itemCode: "", itemDescription: "", quantity: 1 }]); setIsDirty(true); };
  const removeLine = (i: number) => { setLineItems(lineItems.filter((_, idx) => idx !== i)); const m = { ...searchMap }; delete m[String(i)]; setSearchMap(m); setIsDirty(true); };
  const updateLine = (i: number, f: keyof LineItem, v: string | number) => { const u = [...lineItems]; u[i] = { ...u[i], [f]: v }; setLineItems(u); setIsDirty(true); };

  const selectItemForLine = (index: number, itemId: string) => {
    const found = items.find((it) => it.id === itemId);
    if (found) {
      const u = [...lineItems];
      u[index] = { ...u[index], itemId: found.id, itemCode: found.sku, itemDescription: found.name };
      setLineItems(u);
      setSearchMap({ ...searchMap, [String(index)]: `${found.name} (${found.sku})` });
      setIsDirty(true);
    }
  };

  const filteredItems = (q: string) => {
    if (!q) return items;
    const s = q.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s));
  };

  const loadTransaction = (t: SavedTransaction) => {
    setTxnType(t.type); setTxnDate(t.date); setTxnTime(t.time);
    setRequestedBy(t.requestedBy); setDepartment(t.department);
    setPreparedBy(t.preparedBy); setAuthorisedBy(t.authorisedBy);
    setReferenceNo(t.referenceNo); setRemarks(t.remarks);
    setLineItems(t.lineItems);
    const m: Record<string, string> = {};
    t.lineItems.forEach((l, i) => { m[String(i)] = `${l.itemDescription} (${l.itemCode})`; });
    setSearchMap(m);
    setCurrentIndex(history.indexOf(t));
    setIsDirty(false);
  };

  const nav = (dir: "first" | "prev" | "next" | "last") => {
    if (!history.length) return;
    const i = dir === "first" ? 0 : dir === "last" ? history.length - 1 : dir === "prev" ? Math.max(0, currentIndex - 1) : Math.min(history.length - 1, currentIndex + 1);
    if (i >= 0 && i < history.length) loadTransaction(history[i]);
  };

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/inventory/transaction?limit=200");
      if (res.ok) {
        const json = await res.json();
        const g: Record<string, SavedTransaction> = {};
        (json.transactions || []).forEach((t: InventoryTransactionHistoryRow) => {
          const k = `${t.transactionDate}_${t.transactionTime}_${t.referenceNo || t.performedBy}`;
          if (!g[k]) g[k] = { id: k, type: t.type, date: t.transactionDate || "", time: t.transactionTime || "", referenceNo: t.referenceNo || "", requestedBy: t.requestedBy || "", department: t.issuedToDepartment || "", remarks: t.notes || "", preparedBy: t.performedBy || "", authorisedBy: t.authorisedBy || "", lineItems: [], createdAt: t.createdAt };
          g[k].lineItems.push({ id: t.id, itemId: t.itemId, itemCode: t.itemCode || "", itemDescription: t.itemDescription || "", quantity: t.quantity });
        });
        setHistory(Object.values(g).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch { /* */ }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => { if (showHistory && !history.length) fetchHistory(); }, [showHistory, fetchHistory, history.length]);

  const filteredHistory = useMemo(() => {
    if (!historySearch) return history;
    const q = historySearch.toLowerCase();
    return history.filter((t) => t.type.toLowerCase().includes(q) || t.referenceNo.toLowerCase().includes(q) || t.preparedBy.toLowerCase().includes(q) || t.lineItems.some((l) => l.itemDescription.toLowerCase().includes(q)));
  }, [history, historySearch]);

  const handleSave = async () => {
    if (!lineItems.length) { toast.error("Add at least one line item"); return; }
    if (lineItems.some((l) => !l.itemId || l.quantity <= 0)) { toast.error("All items need a valid item and quantity > 0"); return; }
    if (!preparedBy) { toast.error("Prepared by is required"); return; }
    setSubmitting(true);
    try {
      // Single line item: use single transaction API
      if (lineItems.length === 1) {
        const line = lineItems[0];
        const res = await fetch("/api/inventory/transaction", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: line.itemId, type: txnType, quantity: line.quantity, performedBy: preparedBy, notes: remarks || undefined, referenceNo, requestedBy, authorisedBy, transactionDate: txnDate, transactionTime: txnTime, itemCode: line.itemCode, itemDescription: line.itemDescription, issuedToDepartment: department }),
        });
        if (!res.ok) { const e = await res.json(); toast.error(e.error || "Failed"); setSubmitting(false); return; }
      } else {
        // Multiple lines: use batch API for atomic save
        const res = await fetch("/api/inventory/batch", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: txnType, transactionDate: txnDate, transactionTime: txnTime,
            requestedBy, department, authorisedBy, preparedBy,
            referenceNo, remarks,
            lineItems: lineItems.map((l) => ({ itemId: l.itemId, quantity: l.quantity, notes: remarks || undefined })),
          }),
        });
        if (!res.ok) { const e = await res.json(); toast.error(e.error || "Failed"); setSubmitting(false); return; }
      }
      toast.success(`${txnType} saved: ${lineItems.length} item(s), ${totalQty} units`);
      setIsDirty(false); setHistory([]); fetchHistory(); onSuccess();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to save transaction";
      toast.error(message);
    }
    finally { setSubmitting(false); }
  };

  const handleNew = () => { if (isDirty && !confirm("Discard changes?")) return; resetForm(); };

  const sel = TXN_TYPES.find((t) => t.value === txnType) || TXN_TYPES[0];
  const SelIcon = sel.icon;

  if (!open) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9998]" onClick={() => onOpenChange(false)} />

      {/* Floating Panel */}
      <motion.div key="panel"
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[9999] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-slate-200/80 bg-white overflow-hidden flex flex-col"
        style={{ width: panelSize.w, height: panelSize.h, left: pos.x, top: pos.y }}
      >
        {/* Resize handle */}
        <div className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-10" onMouseDown={startResize} />

        {/* Header - Draggable */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 px-5 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none" onMouseDown={startDrag}>
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-white/50" />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20"><SelIcon className="h-4 w-4 text-white" /></div>
            <div>
              <h2 className="text-[15px] font-semibold text-white leading-tight">Stock Transaction</h2>
              <p className="text-[11px] text-sky-100/80 leading-tight">
                {currentIndex >= 0 ? `Record ${currentIndex + 1} of ${history.length}` : "New Transaction"}
                {isDirty && <span className="ml-1.5 text-amber-300 font-medium">● Modified</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" data-no-drag onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchHistory(); }} className="h-7 px-2.5 text-white/90 hover:text-white hover:bg-white/15 text-[11px] gap-1.5">
              {showHistory ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />} History
            </Button>
            <Button variant="ghost" size="icon" data-no-drag onClick={() => onOpenChange(false)} className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/15"><X className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* History Sidebar */}
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="border-r border-slate-100 bg-slate-50/60 flex flex-col shrink-0 overflow-hidden">
                <div className="p-2.5 border-b border-slate-100">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <Input placeholder="Search..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} className="pl-7 h-7 text-[11px] border-slate-200/60 bg-white" />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  {historyLoading ? <div className="flex items-center justify-center py-6"><div className="h-4 w-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
                    : !filteredHistory.length ? <p className="text-[11px] text-slate-400 text-center py-4">No records</p>
                    : <div className="divide-y divide-slate-100/60">
                      {filteredHistory.map((t) => (
                        <button key={t.id} data-no-drag onClick={() => loadTransaction(t)} className={cn("w-full text-left px-2.5 py-2 hover:bg-sky-50/60 transition-colors", currentIndex === history.indexOf(t) ? "bg-sky-50 border-l-2 border-sky-500" : "")}>
                          <div className="flex items-center justify-between"><Badge variant="outline" className="text-[9px] h-3.5 px-1">{t.type}</Badge><span className="text-[9px] text-slate-400">{formatDateDisplay(t.date)}</span></div>
                          <p className="text-[11px] font-medium text-slate-700 mt-0.5 truncate">{t.lineItems.map((l) => l.itemDescription).join(", ")}</p>
                          <p className="text-[10px] text-slate-400">{t.lineItems.reduce((s, l) => s + l.quantity, 0)} units</p>
                        </button>
                      ))}
                    </div>}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Form */}
          <div className="flex-1 flex flex-col min-w-0">
            <ScrollArea className="flex-1">
              <div className="px-5 py-4 space-y-4">
                {/* Type Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {TXN_TYPES.map((t) => { const I = t.icon; return (
                    <button key={t.value} data-no-drag onClick={() => { setTxnType(t.value); setIsDirty(true); }} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-left", txnType === t.value ? cn(t.border, t.bg, "shadow-sm") : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50")}>
                      <I className={cn("h-4 w-4 shrink-0", txnType === t.value ? t.color : "text-slate-300")} />
                      <span className={cn("text-[12px] font-medium", txnType === t.value ? t.color : "text-slate-500")}>{t.label}</span>
                    </button>
                  ); })}
                </div>

                {/* Row 1: Date, Time, Reference */}
                <div className="grid grid-cols-3 gap-3">
                  <Field icon={<Calendar className="h-3 w-3" />} label="Date"><Input type="date" value={txnDate} onChange={(e) => { setTxnDate(e.target.value); setIsDirty(true); }} className="h-8 text-[13px] border-slate-200/60" /></Field>
                  <Field icon={<Clock className="h-3 w-3" />} label="Time"><Input type="time" value={txnTime} onChange={(e) => { setTxnTime(e.target.value); setIsDirty(true); }} className="h-8 text-[13px] border-slate-200/60" /></Field>
                  <Field icon={<Hash className="h-3 w-3" />} label="Reference"><Input value={referenceNo} onChange={(e) => { setReferenceNo(e.target.value); setIsDirty(true); }} placeholder="PO#, GRN#..." className="h-8 text-[13px] border-slate-200/60" /></Field>
                </div>

                {/* Row 2: Requested By, Department */}
                <div className="grid grid-cols-2 gap-3">
                  <Field icon={<User className="h-3 w-3" />} label="Requested By"><Input value={requestedBy} onChange={(e) => { setRequestedBy(e.target.value); setIsDirty(true); }} placeholder="Requester name" className="h-8 text-[13px] border-slate-200/60" /></Field>
                  <Field icon={<Building2 className="h-3 w-3" />} label="Department"><Input value={department} onChange={(e) => { setDepartment(e.target.value); setIsDirty(true); }} placeholder="Department" className="h-8 text-[13px] border-slate-200/60" /></Field>
                </div>

                <Separator className="bg-slate-100" />

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Package className="h-3.5 w-3.5" />Line Items</span>
                    <Button size="sm" variant="outline" data-no-drag onClick={addLine} className="h-6 text-[11px] gap-1 px-2"><Plus className="h-3 w-3" />Add Line</Button>
                  </div>

                  <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader><TableRow className="bg-slate-50/80 border-slate-100"><TableHead className="text-[10px] font-semibold text-slate-500 w-[30px]">#</TableHead><TableHead className="text-[10px] font-semibold text-slate-500">Item</TableHead><TableHead className="text-[10px] font-semibold text-slate-500 w-[100px]">Code</TableHead><TableHead className="text-[10px] font-semibold text-slate-500 w-[80px] text-center">Qty</TableHead><TableHead className="w-[32px]" /></TableRow></TableHeader>
                      <TableBody>
                        {!lineItems.length ? <TableRow><TableCell colSpan={5} className="text-center text-[12px] text-slate-400 py-6">Click &quot;Add Line&quot; to add items</TableCell></TableRow>
                        : lineItems.map((line, i) => (
                          <TableRow key={line.id} className="border-slate-50 hover:bg-slate-50/30">
                            <TableCell className="text-[11px] text-slate-400 font-mono py-1.5">{i + 1}</TableCell>
                            <TableCell className="py-1.5">
                              <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300 pointer-events-none" />
                                <Input value={searchMap[String(i)] || line.itemDescription || ""} onChange={(e) => { setSearchMap({ ...searchMap, [String(i)]: e.target.value }); if (!e.target.value) { updateLine(i, "itemId", ""); updateLine(i, "itemCode", ""); updateLine(i, "itemDescription", ""); } setIsDirty(true); }} onFocus={(e) => e.target.select()} placeholder="Search item..." className="pl-7 h-7 text-[12px] border-slate-200/60" />
                                {searchMap[String(i)] && (
                                  <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-[140px] overflow-y-auto">
                                    {filteredItems(searchMap[String(i)] || "").slice(0, 6).map((it) => (
                                      <button key={it.id} data-no-drag onClick={() => selectItemForLine(i, it.id)} className="w-full text-left px-2.5 py-1 text-[11px] hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between">
                                        <span className="font-medium">{it.name}</span><span className="text-slate-400 font-mono">{it.sku}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-1.5"><Input value={line.itemCode} onChange={(e) => { updateLine(i, "itemCode", e.target.value); setIsDirty(true); }} className="h-7 text-[11px] font-mono border-slate-200/60 bg-slate-50/50" readOnly={!!line.itemId} /></TableCell>
                            <TableCell className="py-1.5"><Input type="number" min={0} value={line.quantity} onChange={(e) => { updateLine(i, "quantity", Math.max(0, Number(e.target.value))); setIsDirty(true); }} className="h-7 text-[12px] text-center font-mono border-slate-200/60" /></TableCell>
                            <TableCell className="py-1.5"><Button variant="ghost" size="icon" data-no-drag className="h-6 w-6 text-slate-300 hover:text-rose-500" onClick={() => removeLine(i)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {lineItems.length > 0 && (
                    <div className="flex items-center justify-between mt-1.5 px-3 py-1.5 bg-slate-50/80 rounded-lg border border-slate-100">
                      <span className="text-[11px] text-slate-500">{lineItems.length} item(s)</span>
                      <span className="text-[13px] font-bold text-slate-800">Total: {totalQty} units</span>
                    </div>
                  )}
                </div>

                {/* Remarks */}
                <Field icon={<FileText className="h-3 w-3" />} label="Remarks"><Textarea value={remarks} onChange={(e) => { setRemarks(e.target.value); setIsDirty(true); }} placeholder="Notes..." className="text-[12px] border-slate-200/60 min-h-[36px]" /></Field>

                {/* Prepared By, Authorised By */}
                <div className="grid grid-cols-2 gap-3">
                  <Field icon={<User className="h-3 w-3" />} label="Prepared By">
                    <Select value={preparedBy} onValueChange={(v) => { setPreparedBy(v); setIsDirty(true); }}>
                      <SelectTrigger className="h-8 text-[13px] border-slate-200/60"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{staff.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field icon={<Check className="h-3 w-3" />} label="Authorised By"><Input value={authorisedBy} onChange={(e) => { setAuthorisedBy(e.target.value); setIsDirty(true); }} placeholder="Authoriser" className="h-8 text-[13px] border-slate-200/60" /></Field>
                </div>
              </div>
            </ScrollArea>

            {/* Footer - Sticky & Always Visible */}
            <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white px-5 py-3 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <BtnIcon icon={ChevronsLeft} onClick={() => nav("first")} disabled={!history.length || currentIndex === 0} />
                <BtnIcon icon={ChevronLeft} onClick={() => nav("prev")} disabled={!history.length || currentIndex <= 0} />
                <span className="text-[11px] text-slate-500 px-1 min-w-[50px] text-center">
                  {currentIndex >= 0 ? `${currentIndex + 1}/${history.length}` : "New"}
                </span>
                <BtnIcon icon={ChevronRight} onClick={() => nav("next")} disabled={!history.length || currentIndex >= history.length - 1} />
                <BtnIcon icon={ChevronsRight} onClick={() => nav("last")} disabled={!history.length || currentIndex === history.length - 1} />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" data-no-drag onClick={handleNew} className="h-9 text-[12px] gap-1.5 px-3"><Plus className="h-3.5 w-3.5" />Add</Button>
                <Button variant="outline" size="sm" data-no-drag onClick={() => onOpenChange(false)} className="h-9 text-[12px] gap-1.5 px-3">Exit</Button>
                <Button variant="outline" size="sm" data-no-drag onClick={() => onOpenChange(false)} className="h-9 text-[12px] gap-1.5 px-3">Cancel</Button>
                <Button size="sm" data-no-drag onClick={handleSave} disabled={submitting || !lineItems.length} className="h-9 text-[12px] bg-sky-600 hover:bg-sky-700 text-white gap-1.5 px-4">
                  {submitting ? "Saving..." : <><Save className="h-3.5 w-3.5" />Save</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">{icon}{label}</label>
      {children}
    </div>
  );
}

function BtnIcon({ icon: Icon, onClick, disabled }: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; disabled: boolean }) {
  return <button data-no-drag onClick={onClick} disabled={disabled} className={cn("h-6 w-6 flex items-center justify-center rounded hover:bg-slate-100 transition-colors", disabled ? "text-slate-200 cursor-not-allowed" : "text-slate-500 hover:text-slate-700")}><Icon className="h-3 w-3" /></button>;
}
