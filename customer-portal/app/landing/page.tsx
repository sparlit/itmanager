"use client";
import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, CheckCircle2, Menu, X, ChevronRight } from 'lucide-react'
import { PRICE_LIST } from '../../../src/data/price-list'

export default function Landing(){
  const [showModal, setShowModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const categories = Array.from(new Set(PRICE_LIST.map(i => i.group)))
  const items = PRICE_LIST.filter(i => i.price > 0).sort((a,b)=> a.name.localeCompare(b.name) || a.price - b.price)

  const categoryIcons: Record<string, string> = {
    'Hardware': '🖥️',
    'Software': '💿',
    'Network': '🌐',
    'Peripherals': '🖨️',
    'Services': '🔧',
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-violet-500/10 to-transparent blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/landing" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-900">IT</span>
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-spin-slow" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Customer Portal</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/orders" className="text-slate-300 hover:text-white transition-colors">My Orders</Link>
              <Link href="/login" className="text-slate-300 hover:text-white transition-colors">Login</Link>
              <button onClick={() => setShowModal(true)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
                View Prices
              </button>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-300">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/50 px-4 py-4 space-y-3">
            <Link href="/orders" className="block text-slate-300 hover:text-white">My Orders</Link>
            <Link href="/login" className="block text-slate-300 hover:text-white">Login</Link>
            <button onClick={() => { setShowModal(true); setMobileMenuOpen(false); }} className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-semibold">
              View Prices
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700/50 mb-8"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-300">Your Technology Partner</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              IT Services
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Made Simple
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Access our complete range of IT services, hardware, software, and support—all in one place.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={() => setShowModal(true)} className="group px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/25 transition-all flex items-center gap-2">
              View Full Price List
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link href="/orders" className="px-8 py-4 rounded-xl border border-slate-700 text-white font-semibold text-lg hover:bg-slate-800/50 transition-all flex items-center gap-2">
              My Orders
              <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
        >
          {[
            { value: '50+', label: 'Services' },
            { value: '24/7', label: 'Support' },
            { value: '100%', label: 'Satisfaction' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Categories Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Browse by Category</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, idx) => {
            const groupItems = PRICE_LIST.filter(i => i.group === cat && i.price>0).sort((a,b)=> a.name.localeCompare(b.name) || a.price - b.price)
            if(!groupItems.length) return null
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-all hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{categoryIcons[cat] || '📦'}</span>
                  <h3 className="text-xl font-semibold text-white">{cat}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">{groupItems.length} items available</p>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all">
                  View Services <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Price Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50" onClick={() => setShowModal(false)}>
          <div className="fixed inset-4 md:inset-10 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-60 overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-xl font-bold text-white">Full Price List</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left p-3 text-slate-400 font-medium">Item</th>
                      <th className="text-left p-3 text-slate-400 font-medium">Category</th>
                      <th className="text-left p-3 text-slate-400 font-medium">Service</th>
                      <th className="text-right p-3 text-slate-400 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-slate-200">{it.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-400 text-xs">{it.group}</span>
                        </td>
                        <td className="p-3 text-slate-400">{it.serviceType}</td>
                        <td className="p-3 text-right font-bold text-emerald-400">{typeof it.price === 'string' ? it.price : Number(it.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}