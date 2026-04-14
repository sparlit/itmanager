"use client";

import { motion } from "framer-motion";

export function VendorManagementView() {
  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
        Vendor Management
      </h1>
      <p className="text-[13px] text-slate-500">
        Manage vendor information, contracts, performance, and relationships
      </p>
      {/* Vendor management implementation will go here */}
      <div className="p-6 bg-slate-50 rounded-xl">
        <p className="text-slate-500 text-center">
          Vendor Management Module - Implementation Pending
        </p>
      </div>
    </motion.div>
  );
}