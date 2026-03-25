'use client';
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCcw, CheckCircle } from 'lucide-react';
import { syncOfflineOrders } from '@/lib/offline-sync';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // { synced: 0, failed: 0 }

  useEffect(() => {
    // 1. Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('SW_REGISTERED: Shoppify Node Active'))
        .catch((err) => console.error('SW_REGISTRATION_FAILED', err));
    }

    // 2. Network Monitoring
    const handleOnline = async () => {
      setIsOnline(true);
      setSyncing(true);
      const result = await syncOfflineOrders();
      setSyncStatus(result);
      setSyncing(false);
      setLastSync(new Date());
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Sync check
    if (isOnline) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Toast Notification for Sync Success */}
      {showToast && syncStatus?.synced > 0 && (
         <div className="fixed bottom-10 left-10 z-[100] animate-in slide-in-from-left duration-500">
            <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-2xl flex items-center gap-4">
               <CheckCircle className="text-white" />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Action_Sync_Complete</p>
                  <p className="text-[8px] font-bold opacity-80 mt-0.5">Automated sync successful: {syncStatus.synced} order(s) committed.</p>
               </div>
            </div>
         </div>
      )}

      {/* Floating Network Indicator */}
      <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end gap-3 group">
        {!isOnline && (
           <div className="bg-red-600 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl animate-pulse">
              Network_Failure: Offline_Mode_Active
           </div>
        )}
        
        {syncing && (
           <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
              <RefreshCcw size={10} className="animate-spin" /> Node_Synchronization...
           </div>
        )}

        <div className={`p-4 rounded-2xl shadow-2xl border transition-all ${isOnline ? 'bg-white border-gray-100 text-green-500' : 'bg-red-50 border-red-100 text-red-500'}`}>
          <div className="flex items-center gap-3">
             {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
             <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Status</span>
                <span className="text-[10px] font-bold opacity-80 uppercase mt-1">{isOnline ? 'Active' : 'Disconnected'}</span>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
