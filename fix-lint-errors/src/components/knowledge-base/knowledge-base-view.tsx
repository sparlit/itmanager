"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  BookOpen,
  Eye,
  Pencil,
  Trash2,
  SlidersHorizontal,
  X,
  Inbox,
  Sparkles,
  TrendingUp,
  FileText,
  Tag,
  UserCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ComboboxInput } from "@/components/ui/combobox-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { StandardWindow } from "@/components/ui/standard-window";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import type { KnowledgeBaseArticle } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Category Colors ───────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Hardware: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Software: "bg-sky-50 text-sky-700 border-sky-200",
  Network: "bg-violet-50 text-violet-700 border-violet-200",
  Security: "bg-rose-50 text-rose-700 border-rose-200",
  "How-To": "bg-amber-50 text-amber-700 border-amber-200",
  Troubleshooting: "bg-orange-50 text-orange-700 border-orange-200",
  Policy: "bg-slate-100 text-slate-600 border-slate-200",
  General: "bg-slate-100 text-slate-600 border-slate-200",
};

const CATEGORY_DOT_COLORS: Record<string, string> = {
  Hardware: "bg-emerald-500",
  Software: "bg-sky-500",
  Network: "bg-violet-500",
  Security: "bg-rose-500",
  "How-To": "bg-amber-500",
  Troubleshooting: "bg-orange-500",
  Policy: "bg-slate-400",
  General: "bg-slate-400",
};

const CATEGORY_ICONS: Record<string, string> = {
  Hardware: "🔧",
  Software: "💻",
  Network: "🌐",
  Security: "🔒",
  "How-To": "📖",
  Troubleshooting: "🔍",
  Policy: "📋",
  General: "📝",
};

// ─── Constants ──────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "General",
  "Hardware",
  "Software",
  "Network",
  "Security",
  "How-To",
  "Troubleshooting",
  "Policy",
];

const CATEGORY_OPTIONS = [
  { value: "General", label: "📝 General" },
  { value: "Hardware", label: "🔧 Hardware" },
  { value: "Software", label: "💻 Software" },
  { value: "Network", label: "🌐 Network" },
  { value: "Security", label: "🔒 Security" },
  { value: "How-To", label: "📖 How-To" },
  { value: "Troubleshooting", label: "🔍 Troubleshooting" },
  { value: "Policy", label: "📋 Policy" },
];

// ─── Animation Variants ─────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ─── Helpers ────────────────────────────────────────────────────
function getExcerpt(content: string, maxLen = 150): string {
  if (!content) return "No content available.";
  const plain = content.replace(/[#*_`>\-\[\]()]/g, "").replace(/\n+/g, " ").trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "..." : plain;
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function KnowledgeBaseView() {
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit/Delete targets
  const [editingArticle, setEditingArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<KnowledgeBaseArticle | null>(null);

  // Create form state
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createCategory, setCreateCategory] = useState("General");
  const [createTags, setCreateTags] = useState("");
  const [createAuthor, setCreateAuthor] = useState("");

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editAuthor, setEditAuthor] = useState("");

  const { setView } = useAppStore();

  const fetchArticles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (categoryFilter !== "All") params.set("category", categoryFilter);

      const res = await fetch(`/api/knowledge-base?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setArticles(json.articles || []);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    }
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchArticles();
      setLoading(false);
    }
    loadData();
  }, [fetchArticles]);

  // ─── Featured articles (top 3 by views) ──────────────────────
  const featuredArticles = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3);

  // ─── Regular articles (excluding featured) ───────────────────
  const regularArticles = articles.filter(
    (a) => !featuredArticles.some((f) => f.id === a.id)
  );

  // ─── Create handler ──────────────────────────────────────────
  async function handleCreate() {
    if (!createTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createTitle,
          content: createContent,
          category: createCategory,
          tags: createTags,
          author: createAuthor,
          status: "Published",
        }),
      });
      if (res.ok) {
        toast.success("Article created successfully");
        setCreateOpen(false);
        resetCreateForm();
        await fetchArticles();
      } else {
        toast.error("Failed to create article");
      }
    } catch {
      toast.error("Failed to create article");
    } finally {
      setSubmitting(false);
    }
  }

  function resetCreateForm() {
    setCreateTitle("");
    setCreateContent("");
    setCreateCategory("General");
    setCreateTags("");
    setCreateAuthor("");
  }

  // ─── Edit handler ────────────────────────────────────────────
  function openEditDialog(article: KnowledgeBaseArticle) {
    setEditingArticle(article);
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditCategory(article.category);
    setEditTags(article.tags);
    setEditAuthor(article.author);
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editingArticle) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/knowledge-base/update?id=${editingArticle.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editTitle,
            content: editContent,
            category: editCategory,
            tags: editTags,
            author: editAuthor,
          }),
        }
      );
      if (res.ok) {
        toast.success("Article updated successfully");
        setEditOpen(false);
        setEditingArticle(null);
        await fetchArticles();
      } else {
        toast.error("Failed to update article");
      }
    } catch {
      toast.error("Failed to update article");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Delete handler ──────────────────────────────────────────
  function openDeleteDialog(article: KnowledgeBaseArticle) {
    setDeletingArticle(article);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deletingArticle) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/knowledge-base/delete?id=${deletingArticle.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Article deleted successfully");
        setDeleteOpen(false);
        setDeletingArticle(null);
        await fetchArticles();
      } else {
        toast.error("Failed to delete article");
      }
    } catch {
      toast.error("Failed to delete article");
    } finally {
      setSubmitting(false);
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setCategoryFilter("All");
  }

  const hasActiveFilters = searchQuery !== "" || categoryFilter !== "All";

  const totalArticles = articles.length;
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
  const uniqueCategories = new Set(articles.map((a) => a.category)).size;

  // ─── Skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-52 rounded-lg" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Card className="rounded-xl border-slate-200/60">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-9 w-40 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
              <Skeleton className="h-9 flex-1 rounded-lg" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Page Header ───────────────────────────────────────── */}
      <motion.div
        className="flex items-center"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <Button
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-sm shadow-emerald-600/20"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </motion.div>

      {/* ─── Stats Mini-Bar ────────────────────────────────────── */}
      <motion.div
        className="flex flex-wrap gap-3"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        {[
          { label: "Total Articles", count: totalArticles, dot: "bg-slate-400", icon: FileText },
          { label: "Total Views", count: totalViews, dot: "bg-emerald-500", icon: Eye },
          { label: "Categories", count: uniqueCategories, dot: "bg-violet-500", icon: Tag },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3.5 py-2"
          >
            <stat.icon className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[12px] font-medium text-slate-600">
              {stat.label}
            </span>
            <span className="text-[13px] font-semibold text-slate-900">
              {stat.count}
            </span>
          </div>
        ))}
      </motion.div>

      {/* ─── Filter Bar ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <Card className="rounded-xl border-slate-200/60 bg-white">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400 mr-1">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-[12px] font-medium">Filters</span>
              </div>

              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[170px] h-9 rounded-lg text-[13px] border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      <span className="flex items-center gap-1.5">
                        {c !== "All" && (
                          <span>{CATEGORY_ICONS[c] || "📝"}</span>
                        )}
                        {c}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-lg text-[13px] border-slate-200"
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[12px] text-slate-500 hover:text-slate-700 rounded-lg"
                  onClick={clearFilters}
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}

              <div className="ml-auto text-[12px] font-medium text-slate-400">
                {articles.length} article{articles.length !== 1 ? "s" : ""}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Featured / Popular Articles ───────────────────────── */}
      {featuredArticles.length > 0 && !hasActiveFilters && (
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <h2 className="text-[14px] font-semibold text-slate-900">
              Popular Articles
            </h2>
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {featuredArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                variants={itemVariants}
                viewport={{ once: true }}
              >
                <Card
                  className="rounded-xl border-slate-200/60 bg-white card-hover cursor-pointer group hover:border-amber-200/80 transition-all relative overflow-hidden"
                  onClick={() => setView("knowledge-base-detail", article.id)}
                >
                  {/* Amber gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-400" />
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="flex items-center justify-center h-5 w-5 rounded-md bg-amber-100 text-amber-600 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] rounded-lg border font-medium",
                          CATEGORY_COLORS[article.category] || ""
                        )}
                      >
                        {CATEGORY_ICONS[article.category]} {article.category}
                      </Badge>
                    </div>
                    <h3 className="text-[14px] font-semibold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-1.5 line-clamp-2">
                      {getExcerpt(article.content)}
                    </p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Eye className="h-3 w-3" />
                        <span className="font-medium">{article.views}</span>
                        <span>views</span>
                      </div>
                      {article.author && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <UserCircle className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{article.author}</span>
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 ml-auto">
                        {formatRelativeDate(article.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Article Grid ─────────────────────────────────────── */}
      {articles.length === 0 ? (
        <motion.div variants={itemVariants} viewport={{ once: true }}>
          <Card className="rounded-xl border-slate-200/60">
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                  <Inbox className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-slate-600">
                    No articles found
                  </p>
                  <p className="text-[12px] mt-0.5">
                    {hasActiveFilters
                      ? "Try adjusting your filters"
                      : "Create your first knowledge base article"}
                  </p>
                </div>
                {hasActiveFilters ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-1 text-[12px] rounded-lg"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    className="mt-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-sm shadow-emerald-600/20 text-[12px]"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    New Article
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(hasActiveFilters ? articles : regularArticles).map((article) => (
            <motion.div
              key={article.id}
              variants={itemVariants}
              viewport={{ once: true }}
            >
              <Card className="rounded-xl border-slate-200/60 bg-white card-hover cursor-pointer group hover:border-emerald-200/80 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] rounded-lg border font-medium shrink-0",
                        CATEGORY_COLORS[article.category] || ""
                      )}
                    >
                      {CATEGORY_ICONS[article.category]} {article.category}
                    </Badge>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(article);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(article);
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3
                    className="text-[14px] font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mt-2.5"
                    onClick={() => setView("knowledge-base-detail", article.id)}
                  >
                    {article.title}
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-1.5 line-clamp-2">
                    {getExcerpt(article.content)}
                  </p>

                  {article.tags && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {article.tags.split(",").filter(Boolean).slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] rounded-md px-1.5 py-0 bg-slate-100 text-slate-500"
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Eye className="h-3 w-3" />
                      <span className="font-medium">{article.views}</span>
                    </div>
                    {article.author && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <UserCircle className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">{article.author}</span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {formatRelativeDate(article.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* ═══ Create Article Dialog ═══════════════════════════════ */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[720px] rounded-2xl border-slate-200/60 p-0 gap-0 overflow-hidden" showCloseButton={false}>
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-7 py-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')] opacity-50" />
            <DialogHeader className="relative">
              <DialogTitle className="text-[18px] font-semibold text-white flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                New Article
              </DialogTitle>
              <DialogDescription className="text-[13px] text-emerald-100 mt-1">
                Create a new knowledge base article with markdown support.
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[calc(85vh-180px)]">
            <div className="px-7 py-6 space-y-6">
              {/* Section 1: Article Details */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Article Details</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                      Title <span className="text-rose-400">*</span>
                    </label>
                    <Input
                      placeholder="Enter article title..."
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                      className="h-11 rounded-lg text-[14px] border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                      Content <span className="text-[11px] text-slate-400 font-normal ml-1">(Markdown supported)</span>
                    </label>
                    <Textarea
                      placeholder="Write your article content in markdown..."
                      value={createContent}
                      onChange={(e) => setCreateContent(e.target.value)}
                      className="min-h-[200px] rounded-lg text-[14px] border-slate-200 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Classification */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Tag className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Classification</h3>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                    type or select
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                      Category <span className="text-rose-400">*</span>
                    </label>
                    <ComboboxInput
                      value={createCategory}
                      onChange={setCreateCategory}
                      placeholder="Select category..."
                      emptyMessage="Type a custom category."
                      options={CATEGORY_OPTIONS}
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                      Tags <span className="text-[11px] text-slate-400 font-normal ml-1">(comma-separated)</span>
                    </label>
                    <Input
                      placeholder="e.g. vpn, setup, guide"
                      value={createTags}
                      onChange={(e) => setCreateTags(e.target.value)}
                      className="h-11 rounded-lg text-[14px] border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Author */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <UserCircle className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Author</h3>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                    optional
                  </span>
                </div>
                <div>
                  <Input
                    placeholder="Author name..."
                    value={createAuthor}
                    onChange={(e) => setCreateAuthor(e.target.value)}
                    className="h-11 rounded-lg text-[14px] border-slate-200"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white px-7 py-4 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Button type="button" variant="outline" size="sm" onClick={resetCreateForm} className="h-9 text-[12px] gap-1.5 px-3">
                <Plus className="h-3 w-3" />Add
              </Button>
            </div>
            <div className="flex items-center gap-1.5">
              <Button type="button" variant="outline" size="sm" onClick={() => { setCreateOpen(false); resetCreateForm(); }} className="h-9 text-[12px] gap-1.5 px-3">Exit</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { setCreateOpen(false); resetCreateForm(); }} className="h-9 text-[12px] gap-1.5 px-3">Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting} className="h-7 text-[11px] gap-1 px-3 bg-emerald-600 hover:bg-emerald-700">
                {submitting ? "Saving..." : <><BookOpen className="h-3 w-3" />Save</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Edit Article Dialog ═════════════════════════════════ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[720px] rounded-2xl border-slate-200/60 p-0 gap-0 overflow-hidden" showCloseButton={false}>
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-r from-slate-700 via-slate-600 to-emerald-600 px-7 py-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')] opacity-50" />
            <DialogHeader className="relative">
              <DialogTitle className="text-[18px] font-semibold text-white flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
                Edit Article
              </DialogTitle>
              <DialogDescription className="text-[13px] text-slate-200 mt-1">
                Update article content and details.
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[calc(85vh-180px)]">
            <div className="px-7 py-6 space-y-6">
              {/* Section 1: Article Details */}
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Article Details</h3>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                      Title <span className="text-rose-400">*</span>
                    </label>
                    <Input
                      placeholder="Enter article title..."
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-11 rounded-lg text-[14px] border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                      Content <span className="text-[11px] text-slate-400 font-normal ml-1">(Markdown supported)</span>
                    </label>
                    <Textarea
                      placeholder="Write your article content in markdown..."
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[200px] rounded-lg text-[14px] border-slate-200 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Classification */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <Tag className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Classification</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                      Category <span className="text-rose-400">*</span>
                    </label>
                    <ComboboxInput
                      value={editCategory}
                      onChange={setEditCategory}
                      placeholder="Select category..."
                      emptyMessage="Type a custom category."
                      options={CATEGORY_OPTIONS}
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700 block mb-1.5">
                      Tags <span className="text-[11px] text-slate-400 font-normal ml-1">(comma-separated)</span>
                    </label>
                    <Input
                      placeholder="e.g. vpn, setup, guide"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="h-11 rounded-lg text-[14px] border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Author */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <UserCircle className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-900">Author</h3>
                </div>
                <div>
                  <Input
                    placeholder="Author name..."
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="h-11 rounded-lg text-[14px] border-slate-200"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white px-7 py-4 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditOpen(false); setEditingArticle(null); }} className="h-9 text-[12px] gap-1.5 px-3">
                <Plus className="h-3 w-3" />Add
              </Button>
            </div>
            <div className="flex items-center gap-1.5">
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditOpen(false); setEditingArticle(null); }} className="h-9 text-[12px] gap-1.5 px-3">Exit</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { setEditOpen(false); setEditingArticle(null); }} className="h-9 text-[12px] gap-1.5 px-3">Cancel</Button>
              <Button onClick={handleEdit} disabled={submitting} className="h-7 text-[11px] gap-1 px-3 bg-emerald-600 hover:bg-emerald-700">
                {submitting ? "Saving..." : <><Pencil className="h-3 w-3" />Save</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ Delete Confirmation ═════════════════════════════════ */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl border-slate-200/60">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[16px]">
              Delete Article
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-slate-500">
              Are you sure you want to delete &ldquo;{deletingArticle?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg text-[13px]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[13px]"
            >
              {submitting ? "Deleting..." : "Delete Article"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
