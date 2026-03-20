'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, User, ShoppingBag, Menu, LogOut, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('shoppify_admin_auth');
    await supabase.auth.signOut();
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8 lg:gap-12">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-blue-600/20">
                <ShoppingBag size={20} />
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter italic uppercase text-gray-900 group-hover:tracking-[0.1em] transition-all duration-500">SHOPPIFY</span>
            </Link>

            <div className="hidden md:flex space-x-8 items-center">
              <Link href="/" className="text-xs lg:text-sm font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-colors">Home</Link>
              <Link href="/products" className="text-xs lg:text-sm font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-colors">Products</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6 flex-1 justify-end">
            {/* Search Bar */}
            <div className="hidden lg:flex items-center relative max-w-sm w-full group">
              <Search className="absolute left-4 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text"
                placeholder="Find inventory..."
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white focus:border-blue-600 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              {session ? (
                <div className="flex items-center gap-2 md:gap-4">
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                    <User size={16} />
                    <span className="hidden sm:inline text-[11px] font-bold">Hi, {session.user.user_metadata?.full_name?.split(' ')[0] || 'User'}</span>
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/profile?view=login" className="hidden sm:flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-all">
                    <LogIn size={14} /> Login
                  </Link>
                  <Link href="/profile?view=register" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
                    <UserPlus size={14} /> Join
                  </Link>
                </div>
              )}
              
              <div className="w-px h-6 bg-gray-100 mx-1" />
  
              <Link href="/cart" className="p-2 hover:bg-gray-50 rounded-full transition-colors relative group">
                <ShoppingBag className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-[6px] font-black text-white"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
