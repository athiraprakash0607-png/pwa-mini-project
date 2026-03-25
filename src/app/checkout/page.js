'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CreditCard, Truck, ShieldCheck, ArrowLeft, Package, MapPin, Mail, Phone, User as UserIcon, WifiOff } from 'lucide-react';
import Image from 'next/image';
import { saveOfflineOrder } from '@/lib/offline-sync';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Delivery Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  // Product Data from URL
  const product = {
    name: searchParams.get('name'),
    price: parseFloat(searchParams.get('price') || '0'),
    id: searchParams.get('id')
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/profile?view=login');
        return;
      }
      setUser(session.user);
      setFormData(prev => ({ 
        ...prev, 
        fullName: session.user.user_metadata?.full_name || '',
        email: session.user.email || '' 
      }));
      setLoading(false);
    });
  }, [router]);

  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const handleOrder = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setIsOfflineMode(false);
    
    const orderData = {
      user_id: user.id,
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      zip: formData.zip,
      status: 'pending'
    };

    try {
      if (!navigator.onLine) {
        await saveOfflineOrder(orderData);
        setIsOfflineMode(true);
        setShowSuccess(true);
        return;
      }

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) {
        // Fallback to offline storage if server insert fails (e.g. timeout)
        console.warn('Network error, staging locally');
        await saveOfflineOrder(orderData);
        setIsOfflineMode(true);
        setShowSuccess(true);
        return;
      }

      setShowSuccess(true);
    } catch (error) {
      console.error('Order Error:', error);
      // Attempt to save offline as a fallback for ANY failure
      try {
         await saveOfflineOrder(orderData);
         setIsOfflineMode(true);
         setShowSuccess(true);
      } catch (idbErr) {
         alert('ORDER_SYNC_FAILED: Critical system error.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white text-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Initializing_Secure_Gateway</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-500"></div>
          <div className="relative bg-white max-w-lg w-full p-10 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 fade-in duration-500">
            <div className={`w-24 h-24 ${isOfflineMode ? 'bg-orange-500' : 'bg-blue-600'} text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl ${isOfflineMode ? 'shadow-orange-500/30' : 'shadow-blue-600/30'} animate-bounce`}>
              {isOfflineMode ? <WifiOff size={48} /> : <ShieldCheck size={48} />}
            </div>
            
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
               {isOfflineMode ? 'Order_Staged_Offline' : 'Order_Sync_Successful'}
            </h2>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-relaxed mb-12">
              {isOfflineMode ? (
                "INTERRUPT_DETECTED: Your order has been securely cached in your browser's persistent node. It will automatically synchronize with our archival network once connectivity is restored."
              ) : (
                "Your archival package has been reserved and is currently being routed for priority dispatch. Inventory nodes have been updated across the network."
              )}
            </p>

            <div className="space-y-4">
              <button 
                onClick={() => router.push('/profile')}
                className="w-full py-5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-gray-900/20"
              >
                Go_to_Profile
              </button>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-5 text-gray-400 text-[9px] font-black uppercase tracking-[0.4em] hover:text-gray-900 transition-colors"
              >
                Return_to_Hub
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 mb-12 transition-colors">
          <ArrowLeft size={16} /> Return_to_Stock
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          {/* Information Form */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-6 md:space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100">
              <div className="flex items-center gap-4 mb-8 md:mb-12">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Truck size={24} />
                </div>
                <div>
                   <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Final_Logistics</h1>
                   <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Routing Logistics Information</p>
                </div>
              </div>

              <form onSubmit={handleOrder} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Full_Name</label>
                  <div className="relative">
                    <UserIcon size={14} className="absolute left-4 top-4 text-gray-400" />
                    <input required className="w-full pl-10 md:pl-12 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Contact_Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-4 text-gray-400" />
                    <input required type="email" className="w-full pl-10 md:pl-12 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Phone_Line</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-4 text-gray-400" />
                    <input required className="w-full pl-10 md:pl-12 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Physical_Address</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-4 text-gray-400" />
                    <textarea required rows="2" className="w-full pl-10 md:pl-12 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none" placeholder="Street, Landmark..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">City</label>
                  <input required className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">ZIP_Code</label>
                  <input required className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-xl md:rounded-2xl text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                </div>

                <div className="md:col-span-2 pt-4 md:pt-8">
                   <button disabled={isProcessing} className="w-full py-5 md:py-6 bg-gray-900 text-white rounded-[1.5rem] md:rounded-[2rem] text-[10px] md:text-xs font-black uppercase tracking-[0.4em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-gray-900/20 active:scale-95 disabled:opacity-50">
                      {isProcessing ? 'SYNCHRONIZING...' : <><ShieldCheck size={18}/> Commit_Order</>}
                   </button>
                </div>
              </form>
            </div>
          </div>

          {/* Abstract Order Summary */}
          <div className="lg:col-span-12 xl:col-span-4">
             <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-blue-600/10 h-fit sticky top-32">
                <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/10">
                   <Package className="text-blue-500" />
                   <h2 className="text-sm font-black uppercase tracking-widest">Order_Summary</h2>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <p className="text-xl font-black italic uppercase tracking-tighter">{product.name || 'ARCHIVAL_OBJECT'}</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Quantity: 01</p>
                      </div>
                      <p className="text-xl font-bold italic tracking-tighter">${product.price.toFixed(2)}</p>
                   </div>

                   <div className="pt-10 space-y-4 border-t border-white/10">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                         <span>Subtotal</span>
                         <span>${product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                         <span>Shipping_Fee</span>
                         <span>FREE</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                         <span>Import_Duty</span>
                         <span>$0.00</span>
                      </div>
                      <div className="flex justify-between pt-6 border-t border-white/10">
                         <span className="text-sm font-black uppercase tracking-[0.2em]">Grand_Total</span>
                         <span className="text-2xl font-black italic tracking-tighter text-blue-500 font-mono">${product.price.toFixed(2)}</span>
                      </div>
                   </div>
                </div>

                <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                   <div className="flex justify-center gap-4 text-gray-500 mb-2">
                      <CreditCard size={20} />
                      <ShieldCheck size={20} />
                   </div>
                   <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">End-to-End Encrypted Tunnel Active</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
