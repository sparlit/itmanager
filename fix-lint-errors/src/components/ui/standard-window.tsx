"use client";

import { useState, useRef, useEffect, type ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Square, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface StandardWindowProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon: ReactNode;
  headerGradient?: string;
  children: ReactNode;
  onSave?: () => void;
  onAdd?: () => void;
  onNavigate?: (direction: "first" | "prev" | "next" | "last") => void;
  currentIndex?: number;
  totalCount?: number;
  saving?: boolean;
  statusMessages?: string[];
  defaultWidth?: number;
  defaultHeight?: number;
  saveLabel?: string;
  saveIcon?: ReactNode;
  hasChanges?: boolean;
}

export function StandardWindow({
  open,
  onClose,
  title,
  description,
  icon,
  headerGradient = "from-sky-600 via-sky-500 to-cyan-500",
  children,
  onSave,
  onAdd,
  onNavigate,
  currentIndex = -1,
  totalCount = 0,
  saving = false,
  statusMessages = [],
  defaultWidth = 750,
  defaultHeight = 650,
  saveLabel = "Save",
  saveIcon,
  hasChanges = false,
}: StandardWindowProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: defaultWidth, h: defaultHeight });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<string>("");
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const [tickerOffset, setTickerOffset] = useState(0);

   // Center window on open
   useEffect(() => {
     if (open) {
       // Use requestAnimationFrame to prevent cascading renders
       requestAnimationFrame(() => {
         setIsMinimized(false);
         setIsMaximized(false);
         const w = Math.min(defaultWidth, window.innerWidth - 40);
         const h = Math.min(defaultHeight, window.innerHeight - 40);
         setSize({ w, h });
         setPos({ x: Math.max(20, (window.innerWidth - w) / 2), y: Math.max(20, (window.innerHeight - h) / 2) });
       });
     }
   }, [open, defaultWidth, defaultHeight]);

  // Status ticker animation
  useEffect(() => {
    if (!open || statusMessages.length === 0) return;
    const interval = setInterval(() => {
      setTickerOffset((prev) => {
        const next = prev - 0.5;
        return next < -1000 ? 0 : next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [open, statusMessages.length]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, onSave]);

  // Mouse handlers for drag and resize
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        setPos({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      }
      if (isResizing) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        let newW = resizeStart.current.w;
        let newH = resizeStart.current.h;
        let newX = resizeStart.current.px;
        let newY = resizeStart.current.py;

        if (resizeDir.includes("e")) newW = Math.max(400, resizeStart.current.w + dx);
        if (resizeDir.includes("w")) { newW = Math.max(400, resizeStart.current.w - dx); newX = resizeStart.current.px + dx; }
        if (resizeDir.includes("s")) newH = Math.max(300, resizeStart.current.h + dy);
        if (resizeDir.includes("n")) { newH = Math.max(300, resizeStart.current.h - dy); newY = resizeStart.current.py + dy; }

        setSize({ w: newW, h: newH });
        if (resizeDir.includes("w") || resizeDir.includes("n")) setPos({ x: newX, y: newY });
      }
    };
    const onUp = () => { setIsDragging(false); setIsResizing(false); setResizeDir(""); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [isDragging, isResizing, resizeDir, isMaximized]);

  const startDrag = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, [data-no-drag]")) return;
    if (isMaximized) return;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos.x, pos.y, isMaximized]);

  const startResize = useCallback((dir: string) => (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDir(dir);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h, px: pos.x, py: pos.y };
  }, [isMaximized, size.w, size.h, pos.x, pos.y]);

  const toggleMaximize = useCallback(() => {
    if (isMaximized) {
      setIsMaximized(false);
      const w = Math.min(defaultWidth, window.innerWidth - 40);
      const h = Math.min(defaultHeight, window.innerHeight - 40);
      setSize({ w, h });
      setPos({ x: Math.max(20, (window.innerWidth - w) / 2), y: Math.max(20, (window.innerHeight - h) / 2) });
    } else {
      setIsMaximized(true);
      setSize({ w: window.innerWidth, h: window.innerHeight });
      setPos({ x: 0, y: 0 });
    }
  }, [isMaximized, defaultWidth, defaultHeight]);

  const handleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  if (!open) return null;

  const hasNav = onNavigate !== undefined && totalCount > 0;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div key={`backdrop-${title}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9998]"
        onClick={onClose}
      />

      {/* Window Panel */}
      <motion.div key={`window-${title}`}
        ref={windowRef}
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[9999] rounded-lg shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-slate-300/80 bg-white overflow-hidden flex flex-col"
        style={{
          width: isMinimized ? Math.min(defaultWidth, window.innerWidth - 40) : size.w,
          height: isMinimized ? 32 : size.h,
          left: pos.x,
          top: pos.y,
        }}
      >
        {/* Resize handles */}
        {!isMaximized && !isMinimized && (
          <>
            <div className="absolute top-0 left-0 right-0 h-1 cursor-n-resize z-10" onMouseDown={startResize("n")} />
            <div className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize z-10" onMouseDown={startResize("s")} />
            <div className="absolute top-0 bottom-0 left-0 w-1 cursor-w-resize z-10" onMouseDown={startResize("w")} />
            <div className="absolute top-0 bottom-0 right-0 w-1 cursor-e-resize z-10" onMouseDown={startResize("e")} />
            <div className="absolute -top-1 -left-1 w-3 h-3 cursor-nw-resize z-10" onMouseDown={startResize("nw")} />
            <div className="absolute -top-1 -right-1 w-3 h-3 cursor-ne-resize z-10" onMouseDown={startResize("ne")} />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 cursor-sw-resize z-10" onMouseDown={startResize("sw")} />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 cursor-se-resize z-10" onMouseDown={startResize("se")} />
          </>
        )}

        {/* Row 1: Title Bar */}
        <div
          className={cn("bg-gradient-to-r h-8 flex items-center justify-between select-none", headerGradient)}
          onMouseDown={startDrag}
          onDoubleClick={toggleMaximize}
        >
          <div className="flex items-center gap-2 px-3">
            <GripVertical className="h-3.5 w-3.5 text-white/40" />
            <div className="flex h-5 w-5 items-center justify-center rounded bg-white/20">{icon}</div>
            <span className="text-[13px] font-medium text-white">{title}</span>
            {hasChanges && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Unsaved changes" />}
          </div>
              <div className="flex items-center gap-0.5 pr-1">
                <Button variant="ghost" size="icon" data-no-drag onClick={handleMinimize} className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/15 p-0">
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" data-no-drag onClick={toggleMaximize} className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/15 p-0">
                  {isMaximized ? <Square className="h-3 w-3" /> : <Square className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" data-no-drag onClick={onClose} className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/15 p-0" aria-label="Exit">
                  <X className="h-3.5 w-3.5" />
                </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Row 2: Description */}
            <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-200">
              <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
            </div>

            {/* Row 3: Separator */}
            <Separator className="bg-slate-200" />

            {/* Row 4+: Content Area with visible scrollbars */}
            <div className="flex-1 min-h-0 overflow-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#94a3b8 #f1f5f9" }}>
              <div className="p-4">
                {children}
              </div>
            </div>

            {/* Status Ticker */}
            {statusMessages.length > 0 && (
              <>
                <Separator className="bg-slate-200" />
                <div className="bg-slate-50 h-6 overflow-hidden relative border-b border-slate-200">
                  <div
                    ref={tickerRef}
                    className="absolute whitespace-nowrap flex items-center h-full"
                    style={{ transform: `translateX(${tickerOffset}px)` }}
                  >
                    <span className="text-[10px] text-slate-500 px-3">
                      {statusMessages.join("  •  ")}
                    </span>
                    <span className="text-[10px] text-slate-500 px-3">
                      {statusMessages.join("  •  ")}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Controls Row */}
            <Separator className="bg-slate-200" />
            <div className="bg-white px-4 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                {onAdd && (
                  <Button variant="outline" size="sm" data-no-drag onClick={onAdd} className="h-7 text-[11px] gap-1 px-2">
                    Add
                  </Button>
                )}
                {hasNav && (
                  <>
                    <Button variant="ghost" size="icon" data-no-drag onClick={() => onNavigate("first")} disabled={currentIndex === 0} className="h-6 w-6"><svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg></Button>
                    <Button variant="ghost" size="icon" data-no-drag onClick={() => onNavigate("prev")} disabled={currentIndex <= 0} className="h-6 w-6"><svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></Button>
                    <span className="text-[10px] text-slate-500 px-1.5 min-w-[45px] text-center font-medium">
                      {currentIndex >= 0 ? `${currentIndex + 1}/${totalCount}` : "New"}
                    </span>
                    <Button variant="ghost" size="icon" data-no-drag onClick={() => onNavigate("next")} disabled={currentIndex >= totalCount - 1} className="h-6 w-6"><svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></Button>
                    <Button variant="ghost" size="icon" data-no-drag onClick={() => onNavigate("last")} disabled={currentIndex >= totalCount - 1} className="h-6 w-6"><svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg></Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" data-no-drag onClick={onClose} className="h-7 text-[11px] gap-1 px-2">Close</Button>
                {onSave && (
                  <Button data-no-drag onClick={onSave} disabled={saving} className="h-7 text-[11px] gap-1 px-3 bg-sky-600 hover:bg-sky-700 text-white">
                    {saving ? "Saving..." : <>{saveIcon}{saveLabel}</>}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
