import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-amber-500/90 text-white shadow-xl backdrop-blur-md text-xs font-semibold font-mono border border-amber-400 animate-in fade-in slide-in-from-bottom-2">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span>Offline Mode — Serving from local cache</span>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-emerald-500/90 text-white shadow-xl backdrop-blur-md text-xs font-semibold font-mono border border-emerald-400 animate-in fade-in slide-in-from-bottom-2">
        <Wifi className="w-4 h-4" />
        <span>Connection Restored — Synced</span>
      </div>
    );
  }

  return null;
}
