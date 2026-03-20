'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus, ShieldCheck, Package, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Check Auth Status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Load Cart from LocalStorage
    const savedCart = localStorage.getItem('shoppify_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (id, delta) => {
    const updated = cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updated);
    localStorage.setItem('shoppify_cart', JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('shoppify_cart', JSON.stringify(updated));
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center bg-white text-gray-900">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 md:mb-20 border-b border-gray-100 pb-8 md:pb-10 text-center md:text-left space-y-4 md:space-y-0">
          <div className="space-y-2 md:space-y-4">
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em]">Inventory_Reserve_v01</p>
             <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">My_Archival_Cart</h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Items_Synchronized: {cartItems.length}</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="py-24 md:py-40 flex flex-col items-center text-center space-y-8 px-4">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 flex items-center justify-center rounded-3xl border border-dashed border-gray-200">
               <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
            </div>
            <div className="space-y-4">
               <h2 className="text-2xl font-black uppercase italic tracking-tighter">Inventory_Stack_Empty</h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">No items found in your current session reserve.</p>
            </div>
            <Link href="/products" className="px-8 md:px-10 py-4 md:py-5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-blue-600 transition-all flex items-center gap-3">
               Start Filling Inventory <ArrowRight size={14}/>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-6 md:space-y-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-6 md:gap-8 p-6 md:p-8 border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] bg-gray-50/30 hover:bg-white hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500">
                  <div className="w-full sm:w-32 md:w-40 h-40 bg-white rounded-2xl md:rounded-3xl border border-gray-100 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    {item.image_url && item.image_url.startsWith('http') ? (
                       <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : ( 
                       <span className="text-4xl md:text-6xl grayscale opacity-10">{item.image_url || '📦'}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter truncate max-w-[180px] sm:max-w-[300px]">{item.name}</h3>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{item.category || 'Archival Object'}</p>
                      </div>
                      <p className="text-lg md:text-xl font-bold italic tracking-tighter whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>

                    <div className="flex justify-between items-center mt-6 md:mt-8">
                       <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 gap-2 md:gap-4 shadow-sm">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 md:p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Minus size={12}/></button>
                          <span className="text-xs font-black w-4 md:w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 md:p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Plus size={12}/></button>
                       </div>
                       <button onClick={() => removeItem(item.id)} className="flex items-center gap-1 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors">
                          <Trash2 size={12}/> Eliminate
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="lg:col-span-4 h-fit sticky top-32">
               <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-blue-600/10">
                  <div className="flex items-center gap-3 mb-12 pb-6 border-b border-white/10">
                    <Package className="text-blue-500" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Transaction_Calculated</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      <span>Reserve_Subtotal</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      <span>Logistics_Fee</span>
                      <span className="text-green-400">COMPLIMENTARY</span>
                    </div>
                    <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Grand_Total</p>
                          <p className="text-4xl font-black italic tracking-tighter underline decoration-blue-500 decoration-4 underline-offset-8">${calculateTotal().toFixed(2)}</p>
                       </div>
                    </div>
                  </div>

                  <div className="mt-12 space-y-4">
                    <Link href={`/checkout?name=Cart Bundle&price=${calculateTotal()}&id=multi`} className="w-full py-6 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 shadow-2xl shadow-blue-600/20 active:scale-95 transition-all">
                       Proceed to Logistics <ArrowRight size={16}/>
                    </Link>
                    <div className="flex justify-center gap-4 text-white/20 pt-4">
                       <ShieldCheck size={20} />
                       <LayoutGrid size={20} />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
