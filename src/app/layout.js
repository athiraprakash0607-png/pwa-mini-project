import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NetworkStatus from "@/components/NetworkStatus";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SHOPPIFY | Premium Store Node",
  description: "A premium minimalist e-commerce platform with PWA Offline Failure Handling using Next.js and Supabase.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col relative antialiased`}>
        <NetworkStatus />
        {/* Subtle Decorative Accents (Minimalist Greys) */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-200/40 dark:bg-slate-800/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-100/40 dark:bg-slate-900/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        
        <Navbar />
        
        {/* Scrolling Announcement Marquee */}
        <div className="fixed top-20 w-full z-40 bg-gray-900 overflow-hidden py-2 border-b border-white/5 shadow-2xl">
          <div className="animate-marquee whitespace-nowrap flex items-center">
            <div className="marquee-content flex items-center gap-10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span> 
                Free Shipping on Orders Over $100
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span> 
                New Drop: Archival Series Now Live
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span> 
                Global Delivery Within 3-5 Standard Business Days
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span> 
                Join Shoppify+ for Exclusive Rewards & Early Access
              </span>
            </div>
            {/* Duplicated for Seamless Continuity */}
            <div className="marquee-content flex items-center gap-10">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span> 
                Free Shipping on Orders Over $100
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span> 
                New Drop: Archival Series Now Live
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span> 
                Global Delivery Within 3-5 Standard Business Days
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span> 
                Join Shoppify+ for Exclusive Rewards & Early Access
              </span>
            </div>
          </div>
        </div>

        <main className="flex-grow pt-28">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
