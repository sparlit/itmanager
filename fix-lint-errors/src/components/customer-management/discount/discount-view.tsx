"use client";

import { motion } from "framer-motion";

export function DiscountView() {
  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-[20px] font-bold tracking-tight text-slate-900">
        Discount Management
      </h1>
      <p className="text-[13px] text-slate-500">
        Manage customer discounts, promotions, and special offers
      </p>
      {/* Discount management implementation will go here */}
      <div className="p-6 bg-slate-50 rounded-xl">
        <p className="text-slate-500 text-center">
          Discount Management Module - Implementation Pending
        </p>
      </div>
    </motion.div>
  );
}