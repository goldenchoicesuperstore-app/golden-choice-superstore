"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "../../lib/data/categories";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  const hiddenRoutes = ["/auth/login", "/auth/register", "/splash", "/checkout", "/checkout/success"];
  if (hiddenRoutes.some(route => pathname.startsWith(route)) || pathname === "/") {
    return null;
  }

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
  };

  const activeLinkPulse = {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0px 0px 0px rgba(245,194,0,0)", 
      "0px 0px 15px rgba(245,194,0,0.6)", 
      "0px 0px 0px rgba(245,194,0,0)"
    ]
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#F5C200] to-[#C9980A] z-50 shadow-[0_-4px_20px_rgba(201,152,10,0.15)] h-[84px] flex items-center pb-safe">
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="flex overflow-x-auto hide-scrollbar px-2 gap-3 items-center w-full"
      >
        {/* Home Link */}
        <motion.div variants={itemVariants} className="shrink-0">
          <Link 
            href="/categories/hair-products"
            className="relative flex flex-col items-center justify-center min-w-[72px] h-[68px] p-2 rounded-xl text-white group outline-none"
          >
            <motion.div
              whileTap={{ scale: 1.15 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex flex-col items-center relative z-10 w-full h-full"
            >
              {pathname === '/categories/hair-products' ? (
                <>
                  <div className="relative mb-1 z-10 flex items-center justify-center w-12 h-12">
                    <motion.div
                      layoutId="activeHighlight"
                      className="absolute inset-0 bg-white border-2 border-[#F5C200] rounded-full drop-shadow-sm"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      animate={activeLinkPulse}
                      style={{ transition: "all 2s ease-in-out" }}
                    />
                    <span className="text-[#C9980A] relative z-20 flex items-center justify-center w-full h-full">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                    </span>
                  </div>
                  <motion.span 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-bold text-center leading-tight whitespace-nowrap text-white relative z-10"
                  >
                    Home
                  </motion.span>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 group-hover:bg-white/30 mb-1 z-10 relative drop-shadow-sm transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight whitespace-nowrap opacity-90 relative z-10">
                    Home
                  </span>
                </>
              )}
            </motion.div>
          </Link>
        </motion.div>

        {/* Category Links */}
        {CATEGORIES.map((cat) => {
          const isActive = pathname === `/categories/${cat.slug}`;
          return (
            <motion.div variants={itemVariants} key={cat.slug} className="shrink-0">
              <Link 
                href={`/categories/${cat.slug}`}
                className="relative flex flex-col items-center justify-center min-w-[72px] h-[68px] p-2 rounded-xl text-white group outline-none"
              >
                <motion.div
                  whileTap={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="flex flex-col items-center relative z-10 w-full h-full"
                >
                  {isActive ? (
                    <>
                      <div className="relative mb-1 z-10 flex items-center justify-center w-12 h-12">
                        <motion.div
                          layoutId="activeHighlight"
                          className="absolute inset-0 bg-white border-2 border-[#F5C200] rounded-full drop-shadow-sm"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          animate={activeLinkPulse}
                          style={{ transition: "all 2s ease-in-out" }}
                        />
                        <span className="text-2xl text-[#C9980A] relative z-20 flex items-center justify-center w-full h-full">
                          {cat.icon}
                        </span>
                      </div>
                      <motion.span 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-bold text-center leading-tight whitespace-nowrap text-white relative z-10"
                      >
                        {cat.name}
                      </motion.span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 group-hover:bg-white/30 mb-1 z-10 relative drop-shadow-sm transition-colors duration-300">
                        <span className="text-2xl">{cat.icon}</span>
                      </div>
                      <span className="text-[10px] font-bold text-center leading-tight whitespace-nowrap opacity-90 relative z-10">
                        {cat.name}
                      </span>
                    </>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </nav>
  );
}
