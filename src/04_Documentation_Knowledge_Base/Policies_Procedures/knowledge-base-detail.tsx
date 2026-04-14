"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import Markdown from "react-markdown";
import {
  ArrowLeft,
  Eye,
  Pencil,
  Trash2,
  BookOpen,
  Calendar,
  Clock,
  UserCircle,
  Tag,
  FolderOpen,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ComboboxInput } from "@/components/ui/combobox-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════
export function KnowledgeBaseDetail() {
  const { selectedItemId, setView } = useAppStore();
  const [article, setArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit/Delete state
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editAuthor, setEditAuthor] = useState("");

  const fetchArticle = useCallback(async () => {
    if (!selectedItemId) return;
    try {
      const res = await fetch("/api/knowledge-base");
      if (res.ok) {
        const json = await res.json();
        const found = (json.articles || []).find(
          (a: KnowledgeBaseArticle) => a.id === selectedItemId
        );
        if (found) {
          setArticle(found);
          // Increment views
          await fetch("/api/knowledge-base", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: found.id, incrementViews: true }),
          });
          setArticle({ ...found, views: found.views + 1 });
        } else {
          setArticle(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch article:", err);
    }
  }, [selectedItemId]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchArticle();
      setLoading(false);
    }
    loadData();
  }, [fetchArticle]);

  // ─── Edit handler ────────────────────────────────────────────
  function openEditDialog() {
    if (!article) return;
    setEditTitle(article.title);
    setEditContent(article.content);
    setEditCategory(article.category);
    setEditTags(article.tags);
    setEditAuthor(article.author);
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!article) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/knowledge-base/update?id=${article.id}`,
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
        await fetchArticle();
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
  async function handleDelete() {
    if (!article) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/knowledge-base/delete?id=${article.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success("Article deleted successfully");
        setDeleteOpen(false);
        setView("knowledge-base");
      } else {
        toast.error("Failed to delete article");
      }
    } catch {
      toast.error("Failed to delete article");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-36 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-4 rounded" />
          <Skeleton className="h-5 w-24 rounded" />
        </div>
        <Skeleton className="h-10 w-72 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
          <BookOpen className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-[13px] text-slate-500">Article not found.</p>
        <Button
          variant="outline"
          onClick={() => setView("knowledge-base")}
          className="rounded-lg text-[13px] border-slate-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Knowledge Base
        </Button>
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
      {/* ─── Back Button ──────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <button
          onClick={() => setView("knowledge-base")}
          className="group flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Knowledge Base</span>
        </button>
      </motion.div>

      {/* ─── Breadcrumb ───────────────────────────────────────── */}
      <motion.div variants={itemVariants} viewport={{ once: true }}>
        <nav className="flex items-center gap-1.5 text-[12px] text-slate-400">
          <button
            onClick={() => setView("knowledge-base")}
            className="hover:text-emerald-600 transition-colors"
          >
            Knowledge Base
          </button>
          <ChevronRight className="h-3 w-3" />
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] rounded-lg border font-medium",
              CATEGORY_COLORS[article.category] || ""
            )}
          >
            {CATEGORY_ICONS[article.category]} {article.category}
          </Badge>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-600 font-medium truncate max-w-[300px]">
            {article.title}
          </span>
        </nav>
      </motion.div>

      {/* ─── Article Header ───────────────────────────────────── */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mb-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] rounded-lg border font-medium",
                CATEGORY_COLORS[article.category] || ""
              )}
            >
              {CATEGORY_ICONS[article.category]} {article.category}
            </Badge>
            {article.status === "Published" && (
              <Badge className="text-[10px] rounded-lg bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                Published
              </Badge>
            )}
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900 leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
            {article.author && (
              <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
                <UserCircle className="h-3.5 w-3.5 text-slate-400" />
                {article.author}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={openEditDialog}
            className="rounded-lg text-[12px] border-slate-200 hover:bg-slate-50"
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="rounded-lg text-[12px] border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </motion.div>

      {/* ─── Stats Row ─────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        variants={itemVariants}
        viewport={{ once: true }}
      >
        {[
          {
            label: "Views",
            value: article.views,
            icon: Eye,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
          },
          {
            label: "Author",
            value: article.author || "Unknown",
            icon: UserCircle,
            bg: "bg-sky-50",
            color: "text-sky-600",
          },
          {
            label: "Created",
            value: format(new Date(article.createdAt), "MMM dd, yyyy"),
            icon: Calendar,
            bg: "bg-violet-50",
            color: "text-violet-600",
          },
          {
            label: "Last Updated",
            value: formatDistanceToNow(new Date(article.updatedAt), {
              addSuffix: true,
            }),
            icon: Clock,
            bg: "bg-amber-50",
            color: "text-amber-600",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="rounded-xl border-slate-200/60 bg-white card-hover"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                    stat.bg
                  )}
                >
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      "text-[14px] font-bold leading-tight mt-0.5 truncate",
                      stat.color
                    )}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ─── Main Content Area ────────────────────────────────── */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Left: Article Content */}
        <div className="flex-1 min-w-0">
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-0">
                <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                  Article Content
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="prose prose-slate prose-sm max-w-none">
                  <div className="markdown-content text-[14px] leading-relaxed text-slate-700">
                    {article.content ? (
                      <Markdown>{article.content}</Markdown>
                    ) : (
                      <p className="text-slate-400 italic">
                        No content available for this article.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-full lg:w-[320px] space-y-5">
          {/* Article Details Card */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-slate-900">
                  Article Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      icon: FolderOpen,
                      label: "Category",
                      value: (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] rounded-lg border font-medium",
                            CATEGORY_COLORS[article.category] || ""
                          )}
                        >
                          {CATEGORY_ICONS[article.category]} {article.category}
                        </Badge>
                      ),
                    },
                    {
                      icon: UserCircle,
                      label: "Author",
                      value: article.author || "Unknown",
                    },
                    {
                      icon: Eye,
                      label: "View Count",
                      value: `${article.views} views`,
                    },
                    {
                      icon: Calendar,
                      label: "Created",
                      value: format(
                        new Date(article.createdAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      ),
                    },
                    {
                      icon: Clock,
                      label: "Last Updated",
                      value: format(
                        new Date(article.updatedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      ),
                    },
                    {
                      icon: BookOpen,
                      label: "Status",
                      value: (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] rounded-lg border font-medium",
                            article.status === "Published"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          )}
                        >
                          {article.status}
                        </Badge>
                      ),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 py-1.5"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 shrink-0">
                        <item.icon className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                          {item.label}
                        </p>
                        <p className="text-[13px] font-medium text-slate-900 mt-0.5">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tags Card */}
          {article.tags && article.tags.trim() && (
            <motion.div variants={itemVariants} viewport={{ once: true }}>
              <Card className="rounded-xl border-slate-200/60 bg-white card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[14px] font-semibold text-slate-900 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-amber-500" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags
                      .split(",")
                      .filter(Boolean)
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[11px] rounded-lg px-2.5 py-1 bg-slate-100 text-slate-600"
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Danger Zone */}
          <motion.div variants={itemVariants} viewport={{ once: true }}>
            <Card className="rounded-xl border-rose-200/60 bg-rose-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px] font-semibold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[12px] text-rose-600/80 mb-3">
                  Permanently delete this article. This action cannot be undone.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                  className="rounded-lg text-[12px] border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete Article
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ═══ Edit Article Dialog ═════════════════════════════════ */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[720px] rounded-2xl border-slate-200/60 p-0 gap-0 overflow-hidden">
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
                    <BookOpen className="h-3.5 w-3.5" />
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
          <div className="border-t border-slate-100 bg-slate-50/50 px-7 py-4 flex items-center justify-between gap-3">
            <p className="text-[12px] text-slate-400 hidden sm:block">
              Fields marked with <span className="text-rose-400">*</span> are required
            </p>
            <div className="flex items-center gap-2.5 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="rounded-lg text-[13px] border-slate-200 h-10 px-5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg shadow-sm shadow-emerald-600/20 h-10 px-6 text-[13px] font-medium"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Pencil className="mr-1.5 h-4 w-4" />
                    Save Changes
                  </>
                )}
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
              Are you sure you want to delete &ldquo;{article.title}&rdquo;? This action cannot be undone.
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
