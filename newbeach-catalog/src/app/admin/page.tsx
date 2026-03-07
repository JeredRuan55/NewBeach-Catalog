"use client";

import React from "react";
import { TrendingUp, ShoppingBag, Package, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

const STATS = [
  { label: "Vendas Brutas (Mensal)", value: 12850.40, change: "+12.5%", trend: "up", icon: TrendingUp },
  { label: "Novos Pedidos", value: "34", change: "+4", trend: "up", icon: ShoppingBag },
  { label: "Ticket Médio", value: 377.95, change: "-2.1%", trend: "down", icon: ArrowUpRight },
  { label: "Itens no Catálogo", value: "156", change: "0", trend: "neutral", icon: Package },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-bold tracking-tighter text-[#73185e]">Bem-vinda, <span className="font-playfair italic font-normal text-[#BFA054]">Dona NB</span></h1>
        <p className="text-[#73185e]/60 text-[11px] uppercase tracking-widest font-bold mt-2">Visão geral da sua marca de luxo hoje.</p>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white/60 backdrop-blur-sm p-8 border border-[#73185e]/10 space-y-4 hover:border-[#73185e]/40 transition-all rounded-[4px] shadow-sm group">
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#73185e]/5 group-hover:scale-110 transition-transform">
                <stat.icon className="w-4 h-4 text-[#73185e]" />
              </div>
              <div className={cn(
                "flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                stat.trend === "up" ? "text-emerald-600 bg-emerald-50" : stat.trend === "down" ? "text-rose-600 bg-rose-50" : "text-[#73185e]/60 bg-white"
              )}>
                {stat.change}
                {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
              </div>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#73185e]/40 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold tracking-tight text-[#73185e]">
                {typeof stat.value === "number" ? formatCurrency(stat.value) : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Performance Placeholder */}
        <div className="bg-white/60 backdrop-blur-sm p-8 border border-[#73185e]/10 h-[400px] flex flex-col justify-center items-center gap-6 text-center rounded-[4px]">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#73185e]/5 opacity-60">
            <TrendingUp className="w-8 h-8 text-[#73185e]" />
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2 text-[#73185e]">Performance Semanal</h4>
            <p className="text-[11px] text-[#73185e]/40 font-bold uppercase tracking-widest">Sincronizando métricas premium...</p>
          </div>
        </div>

        {/* Quick Actions / Activity Placeholder */}
        <div className="bg-white/60 backdrop-blur-sm p-8 border border-[#73185e]/10 h-[400px] rounded-[4px]">
          <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold mb-6 pb-4 border-b border-[#73185e]/10 text-[#73185e]">Atividade Recente</h4>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-center opacity-80 group">
                <div className="w-2 h-2 rounded-full bg-[#BFA054] group-hover:scale-150 transition-transform" />
                <p className="text-[11px] text-[#73185e]/70 leading-relaxed">
                  <span className="font-bold text-[#73185e]">Novo pedido</span> recebido de <span className="underline decoration-[#BFA054] underline-offset-4">Fernanda Martins</span> no valor de <span className="font-bold">R$ 819,80</span> às 12:45.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

