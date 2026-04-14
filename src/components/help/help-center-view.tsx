"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { motion } from "framer-motion";
import { HelpCircle, Book, MessageCircle, Mail, Phone, ExternalLink, ChevronRight, Search, FileText, Video, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 }
};

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  views: number;
}

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  articles: number;
}

const helpTopics: HelpTopic[] = [
  { id: "getting-started", title: "Getting Started", description: "Basics for new users", icon: Book, articles: 5 },
  { id: "account", title: "Account & Profile", description: "Manage your account", icon: Users, articles: 3 },
  { id: "tickets", title: "Ticket Management", description: "Creating and managing tickets", icon: MessageCircle, articles: 8 },
  { id: "assets", title: "Asset Management", description: "Track and manage assets", icon: FileText, articles: 6 },
  { id: "inventory", title: "Inventory", description: "Stock and inventory control", icon: FileText, articles: 4 },
  { id: "reports", title: "Reports & Analytics", description: "Generating reports", icon: FileText, articles: 3 },
];

const popularArticles: HelpArticle[] = [
  { id: "1", title: "How to create a new ticket", category: "Tickets", excerpt: "Learn how to submit a support ticket...", views: 1250 },
  { id: "2", title: "Resetting your password", category: "Account", excerpt: "Step-by-step guide to reset your password...", views: 980 },
  { id: "3", title: "Adding a new asset", category: "Assets", excerpt: "Walkthrough for adding hardware assets...", views: 756 },
  { id: "4", title: "Understanding ticket priorities", category: "Tickets", excerpt: "Learn about priority levels and SLAs...", views: 634 },
  { id: "5", title: "Bulk importing data", category: "Getting Started", excerpt: "How to use bulk CSV upload feature...", views: 521 },
  { id: "6", title: "Generating reports", category: "Reports", excerpt: "Create and export custom reports...", views: 489 },
];

export function HelpCenterView() {
  const { setView } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filteredArticles = searchQuery
    ? popularArticles.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularArticles;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center py-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 mb-4">
          <HelpCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Help Center</h1>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          Find answers, browse documentation, or contact support for assistance
        </p>
        
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10 text-[13px] border-slate-200 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Contact Support
            </CardTitle>
            <CardDescription className="text-[12px]">
              Need more help? Reach out to our team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => toast.info("Opening email client...")}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-700">Email Support</p>
                  <p className="text-[11px] text-slate-500">support@itmanager.local</p>
                </div>
              </button>
              
              <button
                onClick={() => toast.info("Opening phone dialer...")}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-700">Phone</p>
                  <p className="text-[11px] text-slate-500">+1-555-4400</p>
                </div>
              </button>
              
              <button
                onClick={() => { setView("knowledge-base"); toast.info("Opening Knowledge Base..."); }}
                className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-left"
              >
                <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Book className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-700">Knowledge Base</p>
                  <p className="text-[11px] text-slate-500">Browse articles</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Topics Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Browse by Topic</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {helpTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => { setSelectedTopic(topic.id); toast.info(`Showing ${topic.title} articles...`); }}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left"
            >
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <topic.icon className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-slate-700 truncate">{topic.title}</p>
                <p className="text-[11px] text-slate-500">{topic.articles} articles</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Popular Articles */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Popular Articles</h2>
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => toast.info(`Opening: ${article.title}`)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-[13px] font-medium text-slate-700">{article.title}</p>
                  <p className="text-[11px] text-slate-500">{article.excerpt}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{article.category}</Badge>
                <span className="text-[11px] text-slate-400">{article.views} views</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </button>
          ))}
          
          {filteredArticles.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-[13px] text-slate-500">No articles found for &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Keyboard Shortcuts Reference */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-amber-600" />
              Keyboard Shortcuts
            </CardTitle>
            <CardDescription className="text-[12px]">
              Speed up your workflow with these shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { keys: "Ctrl + K", action: "Search" },
                { keys: "Ctrl + N", action: "New Ticket" },
                { keys: "Ctrl + S", action: "Save" },
                { keys: "Esc", action: "Close Dialog" },
                { keys: "Ctrl + /", action: "Shortcuts" },
                { keys: "Ctrl + ←", action: "Previous" },
                { keys: "Ctrl + →", action: "Next" },
                { keys: "Ctrl + L", action: "Logout" },
              ].map((shortcut) => (
                <div key={shortcut.keys} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="text-[11px] font-mono text-slate-600">{shortcut.keys}</span>
                  <span className="text-[11px] text-slate-500">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
