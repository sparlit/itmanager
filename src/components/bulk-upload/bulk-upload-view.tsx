"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Download, FileText, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const MODULES = [
  { value: "staff", label: "Staff / Team" },
  { value: "assets", label: "Assets" },
  { value: "inventory", label: "Inventory" },
  { value: "tickets", label: "Tickets" },
  { value: "vendors", label: "Vendors" },
  { value: "licenses", label: "Licenses" },
  { value: "knowledge-base", label: "Knowledge Base" },
  { value: "backups", label: "Backups" },
  { value: "budgets", label: "Budgets" },
  { value: "notifications", label: "Notifications" },
];

export function BulkUploadView() {
  const [selectedModule, setSelectedModule] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    totalRows: number;
    errors: string[];
    dryRun: boolean;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))) {
      setFile(droppedFile);
    } else {
      toast.error("Please upload a CSV file");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleDownloadTemplate = async () => {
    if (!selectedModule) {
      toast.error("Please select a module first");
      return;
    }
    try {
      const res = await fetch(`/api/bulk-upload?type=${selectedModule}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedModule}-template.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Template downloaded");
      }
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleUpload = async (dryRun = false) => {
    if (!selectedModule || !file) {
      toast.error("Please select a module and file");
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", selectedModule);
      formData.append("dryRun", String(dryRun));

      const res = await fetch("/api/bulk-upload", { method: "POST", body: formData });
      const json = await res.json();

      if (res.ok) {
        setResult(json);
        toast.success(dryRun ? `Dry run: ${json.success} rows valid` : `Uploaded ${json.success} rows`);
      } else {
        toast.error(json.error || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedModule("");
    setFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-slate-900">Bulk Upload</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Import data from CSV files into any module</p>
        </div>
        <Button variant="outline" size="sm" onClick={resetForm} className="gap-1.5 h-8">
          <X className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Module Selection */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px]">Step 1: Select Module</CardTitle>
          <CardDescription className="text-[12px]">Choose which module to import data into</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {MODULES.map((mod) => (
              <button
                key={mod.value}
                onClick={() => {
                  setSelectedModule(mod.value);
                  setResult(null);
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12px] font-medium transition-all ${
                  selectedModule === mod.value
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                {mod.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Download Template */}
      {selectedModule && (
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">Step 2: Download Template</CardTitle>
            <CardDescription className="text-[12px]">
              Get a CSV template with the correct column headers for {MODULES.find((m) => m.value === selectedModule)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleDownloadTemplate} variant="outline" className="gap-2 h-10">
              <Download className="h-4 w-4" />
              Download {MODULES.find((m) => m.value === selectedModule)?.label} Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* File Upload */}
      {selectedModule && (
        <Card className="border-slate-200/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">Step 3: Upload CSV File</CardTitle>
            <CardDescription className="text-[12px]">Drag and drop or browse to select your CSV file</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragOver
                  ? "border-emerald-400 bg-emerald-50/50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-emerald-500" />
                  <div className="text-left">
                    <p className="text-[14px] font-medium text-slate-900">{file.name}</p>
                    <p className="text-[12px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFile(null); }}
                    className="ml-2 h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                  >
                    <X className="h-3 w-3 text-slate-500" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-[14px] font-medium text-slate-600">Drop CSV file here or click to browse</p>
                  <p className="text-[12px] text-slate-400 mt-1">Only .csv files are accepted</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {selectedModule && file && (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleUpload(true)}
            disabled={uploading}
            variant="outline"
            className="gap-2 h-10 flex-1"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Dry Run (Validate Only)
          </Button>
          <Button
            onClick={() => handleUpload(false)}
            disabled={uploading}
            className="gap-2 h-10 flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Data
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`border-slate-200/70 shadow-sm ${result.failed > 0 && !result.dryRun ? "border-amber-200" : ""}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] flex items-center gap-2">
                {result.failed === 0 ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                {result.dryRun ? "Validation Results" : "Upload Results"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-[20px] font-bold text-slate-900">{result.totalRows}</p>
                  <p className="text-[11px] text-slate-500">Total Rows</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <p className="text-[20px] font-bold text-emerald-600">{result.success}</p>
                  <p className="text-[11px] text-emerald-600/70">Successful</p>
                </div>
                <div className={`rounded-lg p-3 text-center ${result.failed > 0 ? "bg-rose-50" : "bg-slate-50"}`}>
                  <p className={`text-[20px] font-bold ${result.failed > 0 ? "text-rose-600" : "text-slate-400"}`}>
                    {result.failed}
                  </p>
                  <p className="text-[11px] text-slate-500">Failed</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <>
                  <Separator />
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="text-[12px] text-rose-600 bg-rose-50 px-3 py-1.5 rounded-md">
                        {err}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
