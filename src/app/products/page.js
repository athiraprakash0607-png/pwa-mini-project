'use client';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Zap, Laptop, User, UserCheck, Search } from 'lucide-react';
import Image from 'next/image';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchFilter = searchParams.get('search'); // get search query from URL

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const handleAction = (type, product) => {
    if (!user) {
      router.push('/profile?view=login');
      return;
    }
    
    if (type === 'cart') {
      const existingCart = JSON.parse(localStorage.getItem('shoppify_cart') || '[]');
      const itemIndex = existingCart.findIndex(item => item.id === product.id);
      
      if (itemIndex > -1) {
        existingCart[itemIndex].quantity += 1;
      } else {
        existingCart.push({ ...product, quantity: 1 });
      }
      
      localStorage.setItem('shoppify_cart', JSON.stringify(existingCart));
      alert(`UNIT_RESERVED: ${product.name.toUpperCase()} has been staged in your archival cart.`);
      return;
    }

    if (type === 'buy') {
      router.push(`/checkout?name=${encodeURIComponent(product.name)}&price=${product.price}&id=${product.id}`);
      return;
    }
  };

  // Grouping products by Category
  const filteredProducts = useMemo(() => {
    let list = products;
    
    // 1. Apply Search filter first
    if (searchFilter) {
      const query = searchFilter.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category?.toLowerCase().includes(query)
      );
    }

    // 2. Apply Category filter
    if (categoryFilter) {
      list = list.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    return list.reduce((acc, product) => {
      const cat = product.category || 'Other Selections';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {});
  }, [products, categoryFilter, searchFilter]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white text-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Synchronizing_Inventory</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-32 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 md:mb-24 border-b border-gray-100 pb-10 md:pb-12 text-center md:text-left space-y-8 md:space-y-0">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em]">Live_Inventory_Feed_v02</p>
            <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none truncate max-w-xl">
              {searchFilter ? `RESULTS_FOR: "${searchFilter.toUpperCase()}"` : (categoryFilter ? `${categoryFilter.toUpperCase()}_SELECTIONS` : 'PREMIUM_COLLECTIONS')}
            </h1>
            <div className="w-24 md:w-40 h-1.5 bg-gray-900 mx-auto md:mx-0"></div>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2 text-right">
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                Filtered_Results: {Object.values(filteredProducts).flat().length}
             </p>
             <div className="flex gap-2 text-gray-200">
                <LayoutGrid size={16} />
                <List size={16} />
             </div>
          </div>
        </div>

        {/* Dynamic Categories Render */}
        {Object.keys(filteredProducts).length === 0 ? (
           <div className="py-24 md:py-40 text-center text-gray-400 px-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">NO_PRODUCTS_FOUND_IN_THIS_ARCHIVE</p>
              <button 
                onClick={() => router.push('/products')}
                className="mt-8 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:underline"
              >
                Reset_Filtering_Parameters
              </button>
           </div>
        ) : (
          Object.entries(filteredProducts).map(([category, items]) => (
            <div key={category} className="mb-20 md:mb-32">
              {/* Centered Category Header */}
              <div className="flex items-center gap-4 md:gap-8 mb-12 md:mb-16 px-4">
                <div className="flex-1 h-px bg-gray-100"></div>
                <div className="flex flex-col items-center text-center">
                  <p className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">Category_Archive</p>
                  <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter whitespace-nowrap px-2 md:px-4">{category}</h2>
                </div>
                <div className="flex-1 h-px bg-gray-100"></div>
              </div>

              {/* Grid of Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
                {items.map((product) => {
                  const isUrl = product.image_url && product.image_url.startsWith('http');
                  
                  return (
                    <div key={product.id} className="group flex flex-col bg-white hover:bg-gray-50/50 p-6 rounded-[2.5rem] transition-all duration-500 border border-transparent hover:border-gray-100 h-full">
                      <div className="aspect-square bg-white relative overflow-hidden mb-8 rounded-[2rem] shadow-sm border border-gray-50">
                        {isUrl ? (
                          <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-8xl grayscale opacity-10">{product.image_url || '📦'}</div>
                        )}
                        <div className="absolute top-4 right-4 translate-x-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 z-10">
                           <div className="p-3 bg-white text-gray-900 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-colors cursor-pointer active:scale-90" onClick={() => handleAction('cart', product)}>
                             <ShoppingBag size={18} />
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <div className="space-y-4 mb-8">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-blue-600 transition-colors leading-none flex-1 truncate">{product.name}</h3>
                            <p className="text-xl font-bold italic tracking-tighter border-b-2 border-blue-600 whitespace-nowrap">${product.price.toFixed(2)}</p>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed tracking-widest line-clamp-2 h-8">
                            {product.description || "NO_DESCRIPTION_UPLOADED_FOR_THIS_ARCHIVAL_OBJECT"}
                          </p>
                        </div>
                        
                        <div className="flex gap-4 mt-auto">
                          <button 
                            onClick={() => handleAction('cart', product)}
                            className="flex-1 py-4 border-2 border-gray-900 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all rounded-2xl active:scale-95"
                          >
                             Add to Cart
                          </button>
                          <button 
                            onClick={() => handleAction('buy', product)}
                            className="flex-1 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all rounded-2xl active:scale-95"
                          >
                             Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Sub-component Helper
function LayoutGrid({ size = 20 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> }
function List({ size = 20 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> }
