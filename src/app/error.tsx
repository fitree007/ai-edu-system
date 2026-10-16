"use client";

import React, { useEffect } from "react";
import { RefreshCw, AlertTriangle, Trash2, Home } from "lucide-react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client application error caught by boundary:", error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        if ("caches" in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((r) => r.unregister());
          });
        }
        window.location.href = "/";
      }
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black tracking-tight text-white">
            กำลังปรับปรุงเวอร์ชันล่าสุด
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            ระบบได้ตรวจพบการอัปเดตเวอร์ชันใหม่ หรือพบข้อผิดพลาดชั่วคราวในการโหลดข้อมูลบนเบราว์เซอร์
          </p>
          {error?.message && (
            <div className="p-2.5 rounded-xl bg-black/40 text-left font-mono text-[11px] text-red-300 max-h-24 overflow-y-auto break-all border border-red-500/20">
              {error.message}
            </div>
          )}
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>ลองโหลดใหม่อีกครั้ง</span>
          </button>

          <button
            type="button"
            onClick={handleClearCacheAndReload}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-400" />
            <span>ล้างแคชเดิม & โหลดเวอร์ชันล่าสุด</span>
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 pt-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>กลับสู่หน้าแรก</span>
          </a>
        </div>
      </div>
    </div>
  );
}
