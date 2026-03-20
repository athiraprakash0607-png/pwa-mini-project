import Link from 'next/link';
import { ShoppingBag, Instagram, Twitter, Github, Mail, MapPin, Phone, ShieldCheck, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-950 text-white pt-16 md:pt-24 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 md:mb-20">
          
          {/* Brand Identity Section */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white text-gray-950 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-white/5">
                <ShoppingBag size={24} />
              </div>
              <div>
                <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase block leading-none">SHOPPIFY</span>
                <span className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mt-1 block">Global_Marketplace</span>
              </div>
            </Link>
            <p className="text-xs md:text-sm text-gray-400 font-medium leading-relaxed max-w-sm uppercase tracking-tight">
              A curated universe of premium products. Delivering uncompromising quality and architectural design to modern collectors worldwide.
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500/50 transition-all hover:-translate-y-1 bg-white/5">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-2 lg:col-span-4 gap-8">
            <div className="space-y-6 md:space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white border-l-2 border-blue-500 pl-4">Archives</h4>
               <ul className="space-y-3 md:space-y-4">
                  {['Products', 'Men\'s Clothing', 'Women\'s Clothing', 'Electronics'].map((item) => (
                    <li key={item}>
                      <Link href={`/${item.toLowerCase().replace(/[^a-z0-9]/g, '')}`} className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-400 transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
               </ul>
            </div>

            <div className="space-y-6 md:space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white border-l-2 border-blue-500 pl-4">Support</h4>
               <ul className="space-y-3 md:space-y-4">
                  {['Order Status', 'Shipping', 'Returns', 'Privacy'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-400 transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
               </ul>
            </div>
          </div>

          {/* Contact Node */}
          <div className="lg:col-span-3 space-y-6 md:space-y-8">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white border-l-2 border-blue-500 pl-4">Contact_Node</h4>
             <div className="space-y-6">
                <div className="flex gap-4 group">
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-blue-500 transition-colors border border-white/5">
                      <Mail size={14} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Email_Terminal</p>
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest break-all text-gray-300 group-hover:text-white transition-colors">support@shoppify.net</p>
                   </div>
                </div>
                <div className="flex gap-4 group">
                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-blue-500 transition-colors border border-white/5">
                      <MapPin size={14} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Physical_Base</p>
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">Global Hub X-104</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 md:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-center md:text-left">
           <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">
              <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-blue-500" /> AES_256_SECURED</span>
              <span className="hidden md:block w-1 h-1 bg-white/10 rounded-full"></span>
              <span className="flex items-center gap-1.5"><Zap size={12} className="text-blue-500" /> FAST_DISPATCH</span>
           </div>
           
           <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
              &copy; {new Date().getFullYear()} SHOPPIFY.NET / <span className="text-blue-500">ALL_RECORDS_RESERVED</span>
           </p>
        </div>
      </div>
    </footer>
  );
}
