"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, FileText, Ticket, Package, Users, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "ticket" | "asset" | "staff" | "vendor" | "inventory";
  title: string;
  subtitle: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setView } = useAppStore();

  const searchEntities = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searches = await Promise.allSettled([
      fetch(`/api/tickets?search=${encodeURIComponent(searchQuery)}`).then(r => r.json()),
      fetch(`/api/assets?search=${encodeURIComponent(searchQuery)}`).then(r => r.json()),
      fetch(`/api/staff?search=${encodeURIComponent(searchQuery)}`).then(r => r.json()),
      fetch(`/api/vendors?search=${encodeURIComponent(searchQuery)}`).then(r => r.json()),
      fetch(`/api/inventory?search=${encodeURIComponent(searchQuery)}`).then(r => r.json()),
    ]);

    const newResults: SearchResult[] = [];

    if (searches[0].status === "fulfilled") {
      const data = searches[0].value;
      (data.tickets || []).forEach((t: { id: string; title: string; status: string }) => {
        newResults.push({ id: t.id, type: "ticket", title: t.title, subtitle: `Status: ${t.status}` });
      });
    }

    if (searches[1].status === "fulfilled") {
      const data = searches[1].value;
      (data.assets || []).forEach((a: { id: string; name: string; status: string }) => {
        newResults.push({ id: a.id, type: "asset", title: a.name, subtitle: `Status: ${a.status}` });
      });
    }

    if (searches[2].status === "fulfilled") {
      const data = searches[2].value;
      (data.staff || []).forEach((s: { id: string; name: string; department: string }) => {
        newResults.push({ id: s.id, type: "staff", title: s.name, subtitle: `Department: ${s.department}` });
      });
    }

    if (searches[3].status === "fulfilled") {
      const data = searches[3].value;
      (data.vendors || []).forEach((v: { id: string; name: string; category: string }) => {
        newResults.push({ id: v.id, type: "vendor", title: v.name, subtitle: `Category: ${v.category}` });
      });
    }

    if (searches[4].status === "fulfilled") {
      const data = searches[4].value;
      (data.items || []).forEach((i: { id: string; name: string; category: string }) => {
        newResults.push({ id: i.id, type: "inventory", title: i.name, subtitle: `Category: ${i.category}` });
      });
    }

    setResults(newResults.slice(0, 10));
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchEntities(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchEntities]);

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "ticket": setView("ticket-detail", result.id); break;
      case "asset": setView("asset-detail", result.id); break;
      case "staff": setView("staff-detail", result.id); break;
      case "vendor": setView("vendor-detail", result.id); break;
      case "inventory": setView("inventory-detail", result.id); break;
    }
    setIsOpen(false);
    setQuery("");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ticket": return <Ticket className="h-4 w-4 text-blue-400" />;
      case "asset": return <Package className="h-4 w-4 text-green-400" />;
      case "staff": return <Users className="h-4 w-4 text-purple-400" />;
      case "vendor": return <Building2 className="h-4 w-4 text-orange-400" />;
      case "inventory": return <FileText className="h-4 w-4 text-yellow-400" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets, assets, staff..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9 w-64 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:bg-slate-700"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => { setQuery(""); setResults([]); }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
          <ScrollArea className="max-h-80">
            {loading ? (
              <div className="p-4 text-center text-slate-400">Searching...</div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No results found</div>
            ) : (
              <div className="p-2">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-slate-800 text-left"
                  >
                    {getIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{result.title}</p>
                      <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
