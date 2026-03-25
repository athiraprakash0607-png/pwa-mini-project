'use client';
import { WifiOff, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-red-600/10">
          <WifiOff size={48} />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter italic">Network_Lost</h1>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-relaxed">
            SYSTEM_ERROR: Connection to the archival network has been severed. 
            Browsing is restricted to cached inventory nodes.
          </p>
        </div>

        <Link 
          href="/" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-gray-900/20"
        >
          Return_to_Dashboard
        </Link>
      </div>
    </div>
  );
}
