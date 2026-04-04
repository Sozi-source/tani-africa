// components/ui/SimplePageLoader.tsx
'use client';

import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

interface SimplePageLoaderProps {
  message?: string;
}

export function SimplePageLoader({ message = "Loading your dashboard..." }: SimplePageLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-60 animate-pulse" />
            <Truck className="relative h-12 w-12 text-white animate-bounce" />
          </div>
        </motion.div>
        <h2 className="text-white text-xl font-semibold mb-2">Tani Africa</h2>
        <p className="text-white/60 text-sm">{message}</p>
        <div className="mt-4 flex justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ delay: i * 0.2, repeat: Infinity, duration: 0.6 }}
              className="w-2 h-2 bg-orange-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}