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
        className="flex overflow-x-auto hide-scrollbar px-2 justify-between items-center w-full"
      >


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
                        <span className="relative z-20 flex items-center justify-center w-full h-full overflow-hidden rounded-full p-[2px]">
                          <img src={`/nav-icons/${cat.slug}.png`} alt={cat.name} className="w-full h-full object-cover rounded-full" />
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
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 group-hover:bg-white/30 mb-1 z-10 relative drop-shadow-sm transition-colors duration-300 overflow-hidden p-[2px]">
                        <img src={`/nav-icons/${cat.slug}.png`} alt={cat.name} className="w-full h-full object-cover rounded-full" />
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
