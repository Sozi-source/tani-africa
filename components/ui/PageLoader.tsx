// components/ui/PageLoader.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Sparkles, Clock, Package, Shield, MapPin, Zap, Heart } from 'lucide-react';

interface PageLoaderProps {
  isLoading?: boolean;
  minDisplayTime?: number;
}

const loadingMessages = [
  { text: "Loading your dashboard...", icon: Truck, color: "orange" },
  { text: "Fetching the latest updates...", icon: Sparkles, color: "yellow" },
  { text: "Almost there...", icon: Clock, color: "blue" },
  { text: "Preparing your experience...", icon: Package, color: "green" },
  { text: "Securing your connection...", icon: Shield, color: "purple" },
  { text: "Mapping your journey...", icon: MapPin, color: "teal" },
  { text: "Warming up the engines...", icon: Zap, color: "amber" },
  { text: "We're getting things ready...", icon: Heart, color: "pink" },
];

const quotes = [
  "“The secret of getting ahead is getting started.” – Mark Twain",
  "“Quality is not an act, it is a habit.” – Aristotle",
  "“Your time is limited, don't waste it living someone else's life.” – Steve Jobs",
  "“The only way to do great work is to love what you do.” – Steve Jobs",
];

const facts = [
  "Tani Africa connects thousands of drivers with cargo owners daily.",
  "Our platform has facilitated over 10,000 successful deliveries.",
  "We're building Africa's most trusted logistics network.",
  "Join over 5,000 active drivers on our platform.",
];

export function PageLoader({ isLoading = true, minDisplayTime = 800 }: PageLoaderProps) {
  const [shouldRender, setShouldRender] = useState(isLoading);
  const [messageIndex, setMessageIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<Array<{ x: number; y: number; scale: number }>>([]);

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate particles only on client side
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      const newParticles = Array.from({ length: 20 }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.3,
      }));
      setParticles(newParticles);
    }
  }, [isClient]);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    if (isLoading) {
      setShouldRender(true);
      startTime = Date.now();
      
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / minDisplayTime) * 100, 99);
        setProgress(newProgress);
        
        if (newProgress < 99) {
          animationFrame = requestAnimationFrame(animateProgress);
        }
      };
      
      animationFrame = requestAnimationFrame(animateProgress);
      
      setTimeout(() => setShowContent(true), 200);
    } else {
      setProgress(100);
      setTimeout(() => {
        setShouldRender(false);
        setShowContent(false);
        setProgress(0);
      }, 300);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isLoading, minDisplayTime]);

  // Rotate messages
  useEffect(() => {
    if (!isLoading) return;
    
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 6000);
    
    return () => {
      clearInterval(messageInterval);
      clearInterval(quoteInterval);
      clearInterval(factInterval);
    };
  }, [isLoading]);

  if (!shouldRender) return null;

  const currentMessage = loadingMessages[messageIndex];
  const MessageIcon = currentMessage.icon;
  const CurrentQuote = quotes[quoteIndex];
  const CurrentFact = facts[factIndex];

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #2e1065 50%, #1e1b4b 75%, #0f172a 100%)',
          }}
        >
          {/* Animated background particles - only render on client */}
          {isClient && particles.length > 0 && (
            <div className="absolute inset-0 overflow-hidden">
              {particles.map((particle, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: particle.x, 
                    y: particle.y,
                    scale: particle.scale,
                  }}
                  animate={{ 
                    y: [null, -100, 100],
                    x: [null, 50, -50],
                  }}
                  transition={{ 
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="absolute w-1 h-1 bg-white/20 rounded-full"
                />
              ))}
            </div>
          )}

          {/* Gradient orbs */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

          {/* Main content */}
          <div className="relative z-10 text-center max-w-2xl mx-4">
            {/* Animated Logo */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-2xl opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-r from-orange-500/20 to-amber-500/20 backdrop-blur-sm rounded-full w-24 h-24 mx-auto flex items-center justify-center border-2 border-white/30">
                <Truck className="h-10 w-10 text-white animate-bounce" />
              </div>
            </motion.div>

            {/* Brand Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent"
            >
              Tani Africa
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="text-white/50 text-sm mb-8"
            >
              Logistics Platform
            </motion.p>

            {/* Animated Loading Message */}
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageIcon className={`h-5 w-5 text-${currentMessage.color}-400 animate-pulse`} />
                <p className="text-white text-lg font-medium">
                  {currentMessage.text}
                </p>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-64 sm:w-80 h-1.5 bg-white/10 rounded-full overflow-hidden mb-8 mx-auto">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Loading Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 0.6,
                  }}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
                />
              ))}
            </div>

            {/* Rotating Quote */}
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.6, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <p className="text-white/40 text-xs italic max-w-md mx-auto">
                  {CurrentQuote}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Fun Fact */}
            <AnimatePresence mode="wait">
              <motion.div
                key={factIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-white/20 text-[10px] max-w-md mx-auto">
                  💡 {CurrentFact}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Tip */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              className="text-white/20 text-[10px] mt-6"
            >
              Please wait while we prepare your experience
            </motion.p>
          </div>

          {/* Loading spinner ring */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-orange-500 rounded-full animate-spin" />
              <div className="absolute inset-0 border-2 border-transparent border-b-amber-500 rounded-full animate-spin-slow" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}