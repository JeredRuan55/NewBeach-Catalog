"use client";

import React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Tag, 
  Package, 
  Megaphone, 
  ShoppingBag, 
  ChevronLeft,
  LogOut
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Categorias", href: "/admin/categorias", icon: Tag },
  { label: "Estoque / Produtos", href: "/admin/estoque", icon: Package },
  { label: "Campanhas", href: "/admin/campanhas", icon: Megaphone },
  { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#D1C0DB]">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-white/40 backdrop-blur-xl border-r border-[#73185e]/10 flex flex-col fixed h-full z-20">
        <div className="p-8 pb-12">
          <Link href="/" className="flex items-center gap-2 text-[#73185e] hover:opacity-70 transition-opacity">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Ver Site</span>
          </Link>
          <div className="mt-8 text-xl font-bold tracking-tighter text-[#73185e]">
            PANEL <span className="font-playfair italic font-normal text-[#BFA054]">NB</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 text-[11px] uppercase tracking-widest font-bold transition-all group rounded-[4px]",
                pathname === item.href 
                  ? "bg-[#73185e] text-white shadow-lg shadow-[#73185e]/20" 
                  : "text-[#73185e]/60 hover:bg-white/50 hover:text-[#73185e]"
              )}
            >
              <item.icon className={cn("w-4 h-4", pathname === item.href ? "text-white" : "text-[#73185e]/40")} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#73185e]/10">
          <button className="flex items-center gap-4 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-rose-600 hover:bg-rose-50 transition-all rounded-[4px] w-full">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-12 relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
