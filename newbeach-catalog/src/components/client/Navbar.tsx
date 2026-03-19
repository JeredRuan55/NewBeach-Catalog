"use client";

import React from "react";
import { ShoppingBag, Search, Menu, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { totalItems, openCart } = useCart();

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 glass-nav py-3 md:py-4 h-16 md:h-20">
      <div className="max-w-7xl mx-auto grid grid-cols-3 items-center h-full px-4 md:px-12 relative">
        {/* Left Side (Menu/Links) */}
        <div className="flex justify-start">
          <div className="md:hidden">
            <Menu className="w-5 h-5 text-[#73185e] cursor-pointer" />
          </div>
          <div className="hidden md:flex items-center space-x-8 text-[10px] font-bold uppercase tracking-widest text-[#73185e]/70">
            <Link href="/colecoes" className="hover:text-[#BFA054] transition-colors cursor-pointer">Coleções</Link>
            <Link href="/sobre" className="hover:text-[#BFA054] transition-colors cursor-pointer">Sobre</Link>
          </div>
        </div>

        {/* Empty middle for Logo centering */}
        <div className="pointer-events-none" />

        {/* Right Side (Icons) */}
        <div className="flex items-center justify-end space-x-4 md:space-x-8">
          <Search className="w-5 h-5 text-[#73185e] cursor-pointer hidden md:block hover:text-[#BFA054] transition-colors" />
          <User className="w-4 h-4 md:w-5 md:h-5 text-[#73185e] cursor-pointer hover:text-[#BFA054] transition-colors" />
          <div 
            onClick={openCart}
            className="relative cursor-pointer group"
          >
            <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-[#73185e] group-hover:text-[#BFA054] transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#BFA054] text-white text-[8px] md:text-[9px] min-w-[14px] md:min-w-[16px] h-[14px] md:h-[16px] px-1 rounded-full flex items-center justify-center font-bold animate-in zoom-in duration-300">
                {totalItems}
              </span>
            )}
          </div>
        </div>

        {/* Logo (Perfect Absolute Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <Link href="/" className="flex flex-col items-center hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 md:gap-3">
              <img src="/logo.png" alt="NewBeach Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain brightness-[1.1]" />
              <span className="text-lg md:text-2xl font-bold tracking-tighter text-[#73185e]">NEWBEACH</span>
            </div>
            <span className="text-[6px] md:text-[8px] tracking-[0.4em] md:tracking-[0.6em] font-light mt-[-2px] text-[#BFA054] md:ml-11">PREMIUM</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
