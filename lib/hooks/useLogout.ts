// lib/hooks/useLogout.ts
'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UseLogoutOptions {
  redirectTo?: string;
  delay?: number;
  showOverlay?: boolean;
}

export function useLogout(options: UseLogoutOptions = {}) {
  const { redirectTo = '/auth/login', delay = 800, showOverlay = true } = options;
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    if (showOverlay) {
      const overlay = document.createElement('div');
      overlay.id = 'logout-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #2e1065 50%, #1e1b4b 75%, #0f172a 100%);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      
      const userName = user?.firstName || 'Valued User';
      
      overlay.innerHTML = `
        <style>
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
          @keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }
          @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        </style>
        
        <div style="position: absolute; inset: 0; overflow: hidden;">
          <div style="position: absolute; top: 20%; left: 10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%); border-radius: 50%; filter: blur(60px); animation: float 6s ease-in-out infinite;"></div>
          <div style="position: absolute; bottom: 20%; right: 10%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%); border-radius: 50%; filter: blur(60px); animation: float 6s ease-in-out infinite reverse;"></div>
          <div style="position: absolute; top: 50%; left: 50%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%); border-radius: 50%; filter: blur(80px); transform: translate(-50%, -50%);"></div>
        </div>
        
        <div style="position: relative; z-index: 10; text-align: center; max-width: 400px; margin: 0 20px;">
          <div style="margin-bottom: 30px;">
            <div style="position: relative; width: 100px; height: 100px; margin: 0 auto;">
              <div style="position: absolute; inset: -10px; background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899); border-radius: 50%; filter: blur(15px); opacity: 0.6; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
              <div style="position: relative; width: 100px; height: 100px; background: linear-gradient(135deg, #1e293b, #1e1b4b); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.2);">
                <svg style="width: 50px; height: 50px; color: white; animation: bounce 1s infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 15h18M3 9h18M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
                  <path d="M8 21v-4m8 4v-4"/>
                </svg>
              </div>
            </div>
          </div>
          
          <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 8px; background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Tani Africa</h1>
          <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin-bottom: 24px;">Logistics Platform</p>
          
          <div style="margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
              <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: pulse 1s infinite;"></div>
              <p style="color: white; font-size: 18px; font-weight: 500;">Logging out of Tani Africa...</p>
            </div>
            <p style="color: rgba(255,255,255,0.6); font-size: 14px;">Goodbye, <span style="color: white; font-weight: 500;">${userName}</span></p>
          </div>
          
          <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
            <div style="width: 0%; height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899); border-radius: 10px; animation: loading 1.5s ease-out forwards;"></div>
          </div>
          
          <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 24px;">
            <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: bounce 0.6s infinite;"></div>
            <div style="width: 8px; height: 8px; background: #8b5cf6; border-radius: 50%; animation: bounce 0.6s infinite 0.2s;"></div>
            <div style="width: 8px; height: 8px; background: #ec4899; border-radius: 50%; animation: bounce 0.6s infinite 0.4s;"></div>
            <div style="width: 8px; height: 8px; background: #06b6d4; border-radius: 50%; animation: bounce 0.6s infinite 0.6s;"></div>
            <div style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: bounce 0.6s infinite 0.8s;"></div>
          </div>
          
          <div style="position: relative; width: 48px; height: 48px; margin: 0 auto;">
            <div style="position: absolute; inset: 0; border: 3px solid rgba(255,255,255,0.1); border-radius: 50%;"></div>
            <div style="position: absolute; inset: 0; border: 3px solid transparent; border-top-color: #3b82f6; border-right-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <div style="position: absolute; inset: 0; border: 3px solid transparent; border-bottom-color: #ec4899; border-left-color: #06b6d4; border-radius: 50%; animation: spin 1.5s linear infinite reverse;"></div>
          </div>
          
          <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin-top: 24px;">Thank you for choosing Tani Africa</p>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 10);
    }
    
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=');
        if (name && name.trim()) {
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      
      logout();
      window.location.replace(redirectTo);
    }, delay);
  }, [isLoggingOut, logout, redirectTo, delay, showOverlay, user]);

  return { handleLogout, isLoggingOut };
}