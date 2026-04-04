'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Truck, Shield, CheckCircle, Heart } from 'lucide-react';
import React from 'react';

interface LogoutLoaderProps {
  message?: string;
  userName?: string;
}

/* ✅ Static steps (no re‑creation per render) */
const STEPS = [
  { text: 'Signing you out…', icon: Truck },
  { text: 'Securing your session…', icon: Shield },
  { text: 'Logout complete. See you soon.', icon: CheckCircle },
];

export function LogoutLoader({ message, userName }: LogoutLoaderProps) {
  const [step, setStep] = React.useState(0);
  const prefersReducedMotion = useReducedMotion();

  /* ✅ Runs immediately, stops automatically */
  React.useEffect(() => {
    if (step >= STEPS.length - 1) return;

    const timer = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 900);

    return () => clearTimeout(timer);
  }, [step]);

  const CurrentIcon = STEPS[step].icon;

  return (
    <AnimatePresence>
      <motion.div
        key="logout-loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="
          fixed inset-0 z-[9999]
          flex items-center justify-center
          bg-gradient-to-br
          from-[#120608]
          via-[#1A0A0E]
          to-[#1F0A0E]
        "
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="
            w-full max-w-sm mx-4
            rounded-2xl
            bg-[#F7EFEA]
            shadow-[0_25px_60px_rgba(122,16,35,0.35)]
            overflow-hidden
          "
        >
          <div className="h-1.5 bg-[#7A1023]" />

          <div className="p-6 text-center">
            {/* Icon */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? undefined
                  : { scale: [1, 1.04, 1] }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
              }
              className="
                mx-auto mb-4
                flex h-16 w-16 items-center justify-center
                rounded-full bg-[#F1E3DD]
              "
            >
              <CurrentIcon className="h-8 w-8 text-[#7A1023]" />
            </motion.div>

            <h1 className="text-xl font-extrabold tracking-tight text-[#1F0A0E]">
              Tani Africa
            </h1>
            <p className="text-xs tracking-wide text-gray-600 mb-4">
              Premium Logistics Platform
            </p>

            <motion.p
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-semibold text-[#2D0F14] mb-2"
            >
              {message ?? STEPS[step].text}
            </motion.p>

            {userName && (
              <p className="text-xs text-gray-600">
                Goodbye{' '}
                <span className="font-semibold text-[#7A1023]">
                  {userName}
                </span>
              </p>
            )}

            {/* Progress Bar */}
            <div className="mt-5 h-2 w-full rounded-full bg-[#E7D3CC] overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{
                  width: `${((step + 1) / STEPS.length) * 100}%`,
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="
                  h-full
                  bg-gradient-to-r
                  from-[#7A1023]
                  via-[#9B1D32]
                  to-[#C89B3C]
                "
              />
            </div>

            <div className="mt-5 flex items-center justify-center gap-1 text-xs text-gray-500">
              <Heart className="h-3 w-3 text-[#7A1023]" />
              Crafted with care in Kenya
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}