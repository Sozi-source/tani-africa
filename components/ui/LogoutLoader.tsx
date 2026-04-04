'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Shield, CheckCircle, Heart } from 'lucide-react';
import React from 'react';

interface LogoutLoaderProps {
  message?: string;
  userName?: string;
}

export function LogoutLoader({ message, userName }: LogoutLoaderProps) {
  const steps = [
    { text: 'Logging out…', icon: Truck },
    { text: 'Securing your session…', icon: Shield },
    { text: 'All set. See you soon!', icon: CheckCircle },
  ];

  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = steps[step].icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="
          fixed inset-0 z-[9999]
          flex items-center justify-center
          bg-[#0B0F14]
        "
      >
        {/* Main Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="
            w-full max-w-sm mx-4
            rounded-2xl
            bg-white
            shadow-2xl
            overflow-hidden
          "
        >
          {/* Header Accent */}
          <div className="h-2 bg-red-600" />

          <div className="p-6 text-center">
            {/* Icon */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="
                mx-auto mb-4
                flex h-16 w-16 items-center justify-center
                rounded-full bg-red-100
              "
            >
              <CurrentIcon className="h-8 w-8 text-red-600" />
            </motion.div>

            {/* Brand */}
            <h1 className="text-xl font-bold text-gray-900">
              Tani Africa
            </h1>
            <p className="text-xs text-gray-500 mb-4">
              Secure Logistics Platform
            </p>

            {/* Message */}
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium text-gray-800 mb-2"
            >
              {message ?? steps[step].text}
            </motion.p>

            {userName && (
              <p className="text-xs text-gray-500">
                Goodbye, <span className="font-medium">{userName}</span>
              </p>
            )}

            {/* Progress Bar */}
            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="h-full bg-yellow-400"
              />
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-center gap-1 text-xs text-gray-400">
              <Heart className="h-3 w-3 text-red-500" />
              Built with care in Kenya
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}