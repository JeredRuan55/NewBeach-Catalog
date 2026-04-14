"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Package, Users, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageTicket: 0,
    catalogItems: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders (Not Canceled)
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status, customer_name, created_at')
        .neq('status', 'cancelado');
      
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // 2. Fetch Products Count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (orders) {
        const totalSales = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const totalOrders = orders.length;
        const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

        setStats({
          totalSales,
          totalOrders,
          averageTicket,
          catalogItems: productCount || 0
        });
      }

      if (allOrders) {
        setRecentOrders(allOrders);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const STATS_CONFIG = [
    { label: "Vendas Brutas (Total)", value: stats.totalSales, change: "Real", trend: "up", icon: TrendingUp },
    { label: "Pedidos Ativos", value: stats.totalOrders.toString(), change: "Live", trend: "up", icon: ShoppingBag },
    { label: "Ticket Médio", value: stats.averageTicket, change: "Real", trend: "up", icon: ArrowUpRight },
    { label: "Itens no Catálogo", value: stats.catalogItems.toString(), change: "Total", trend: "neutral", icon: Package },
  ];

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl font-bold tracking-tighter text-[#73185e]">Bem-vinda, <span className="font-playfair italic font-normal text-[#BFA054]">Dona NB</span></h1>
        <p className="text-[#73185e]/60 text-[11px] uppercase tracking-widest font-bold mt-2">Visão geral da sua marca de luxo hoje.</p>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_CONFIG.map((stat) => (
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
              <h3 className={cn(
                "text-2xl font-bold tracking-tight text-[#73185e]",
                loading && "animate-pulse opacity-50"
              )}>
                {loading ? "..." : (typeof stat.value === "number" ? formatCurrency(stat.value) : stat.value)}
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
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2 text-[#73185e]">Performance em Tempo Real</h4>
            <p className="text-[11px] text-[#73185e]/40 font-bold uppercase tracking-widest">Painel sincronizado com a base de dados.</p>
          </div>
        </div>

        {/* Quick Actions / Activity Feed */}
        <div className="bg-white/60 backdrop-blur-sm p-8 border border-[#73185e]/10 h-[400px] rounded-[4px] overflow-hidden flex flex-col">
          <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold mb-6 pb-4 border-b border-[#73185e]/10 text-[#73185e]">Atividade Recente</h4>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
               <p className="text-[10px] uppercase tracking-widest text-[#73185e]/30 italic text-center py-20">Carregando atividade...</p>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex gap-4 items-start opacity-80 group">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 transition-transform group-hover:scale-150",
                    order.status === 'cancelado' ? "bg-rose-400" : "bg-[#BFA054]"
                  )} />
                  <div className="flex-1">
                    <p className="text-[11px] text-[#73185e]/70 leading-relaxed">
                      <span className="font-bold text-[#73185e]">
                        {order.status === 'cancelado' ? "Pedido cancelado" : "Novo pedido"}
                      </span> recebido de <span className="underline decoration-[#BFA054] underline-offset-4">{order.customer_name}</span> no valor de <span className="font-bold">{formatCurrency(order.total_amount)}</span>.
                    </p>
                    <p className="text-[9px] text-[#73185e]/40 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] uppercase tracking-widest text-[#73185e]/30 italic text-center py-20">Nenhuma atividade recente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

