'use client';
import Link from 'next/link';
import { ArrowRight, MoveRight, ShoppingBag, Zap, Laptop, User, UserCheck } from 'lucide-react';

export default function Home() {
  const categories = [
    { 
      name: "Men's Collection", 
      slug: "mens", 
      description: "ARCHIVAL APPAREL & ACCESSORIES.", 
      icon: <User className="w-8 h-8" />,
      bg: "bg-blue-50/50"
    },
    { 
      name: "Women's Collection", 
      slug: "womens", 
      description: "CONTEMPORARY ESSENTIALS.", 
      icon: <UserCheck className="w-8 h-8" />,
      bg: "bg-rose-50/50"
    },
    { 
      name: "Electronics", 
      slug: "electronics", 
      description: "HIGH-PERFORMANCE HARDWARE.", 
      icon: <Laptop className="w-8 h-8" />,
      bg: "bg-gray-50/50"
    }
  ];

  return (
    <div className="w-full bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 md:py-32 flex flex-col items-center text-center">
        <div className="space-y-6 md:space-y-8 z-10 max-w-4xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] border border-blue-100 animate-fade-in-up">
            Global Shipping Available
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic">
            MODERN <br /> 
            <span className="text-blue-600 italic">MARKETPLACE.</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed uppercase tracking-tight px-4">
            Discover a curated universe of premium products. From state-of-the-art electronics to archival fashion, SHOPPIFY delivers uncompromising quality and architectural design directly to your doorstep.
          </p>
          <div className="flex justify-center pt-4">
            <Link href="/products" className="group flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl md:rounded-2xl hover:bg-blue-600 shadow-2xl shadow-gray-900/20 transition-all active:scale-95">
              Explore All Products <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-24 border-t border-gray-100 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col mb-12 md:mb-16 px-4 text-center md:text-left">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-blue-600 mb-2">Shop_by</h2>
            <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">Primary_Categories</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4">
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                href={`/products?category=${cat.slug}`}
                className={`group relative p-8 md:p-10 ${cat.bg} border border-gray-100 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden hover:border-blue-200 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-600/5`}
              >
                <div className="relative z-10 space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                    <div className="text-blue-600">{cat.icon}</div>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-1">{cat.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="pt-6 flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    View Collection <MoveRight size={14} className="ml-2" />
                  </div>
                </div>
                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal Visual Section */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="w-full h-px bg-gray-100 mb-32 relative">
             <div className="absolute left-1/2 -translate-x-1/2 -top-3 px-6 bg-white text-[10px] font-black uppercase tracking-[1em] text-gray-300">Shoppify_Series</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full opacity-30 grayscale hover:grayscale-0 transition-all duration-1000 cursor-crosshair">
             {[1,2,3,4].map(i => (
               <div key={i} className="aspect-[3/4] bg-gray-100 rounded-3xl border border-gray-200"></div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
}
