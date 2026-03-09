"use client";

import React from "react";
import { ShoppingBag, Search, Menu, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { totalItems, openCart } = useCart();

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 glass-nav px-6 py-4 md:px-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Menu className="w-6 h-6 text-[#73185e] cursor-pointer" />
        </div>

        {/* Desktop Links Left */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold uppercase tracking-widest text-[#73185e]/70">
          <Link href="/colecoes" className="hover:text-[#BFA054] transition-colors decoration-[#BFA054] cursor-pointer">Coleções</Link>
          <Link href="/sobre" className="hover:text-[#BFA054] transition-colors cursor-pointer">Sobre</Link>
        </div>

        {/* Logo */}
        <div className="text-2xl font-bold tracking-tighter text-[#73185e] flex flex-col items-center">
          <Link href="/" className="hover:scale-105 transition-transform">NEWBEACH</Link>
          <span className="text-[8px] tracking-[0.6em] font-light mt-[-4px] text-[#BFA054]">PREMIUM</span>
        </div>

        {/* Desktop Links Right + Icons */}
        <div className="flex items-center space-x-6 md:space-x-8">
          <Search className="w-5 h-5 text-[#73185e] cursor-pointer hidden md:block hover:text-[#BFA054] transition-colors" />
          <User className="w-5 h-5 text-[#73185e] cursor-pointer hover:text-[#BFA054] transition-colors" />
          <div 
            onClick={openCart}
            className="relative cursor-pointer group"
          >
            <ShoppingBag className="w-5 h-5 text-[#73185e] group-hover:text-[#BFA054] transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#BFA054] text-white text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-bold animate-in zoom-in duration-300">
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
