"use client";

import React, { useEffect, useState } from "react";
import { Search, Eye, User, Clock, CheckCircle2, Package, Truck, Loader2 } from "lucide-react";
import { formatCurrency, getStatusLabel, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Order {
  id: string;
  customer_name: string;
  total_amount: number;
  status: 'pendente' | 'pago' | 'separando' | 'enviado' | 'concluido';
  created_at: string;
  items: any[];
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    
    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        setOrders(prev => [payload.new as Order, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new as Order : o));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
    }
  };

  const statusIcons: Record<string, any> = {
    pendente: Clock,
    pago: CheckCircle2,
    separando: Package,
    enviado: Truck,
    concluido: CheckCircle2,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-amber-50 text-amber-600 border-amber-100',
      pago: 'bg-green-50 text-green-600 border-green-100',
      separando: 'bg-blue-50 text-blue-600 border-blue-100',
      enviado: 'bg-purple-50 text-purple-600 border-purple-100',
      concluido: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-500 border-gray-100';
  };

  return (
    <div className="space-y-12 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-[#73185e]">Fluxo de <span className="font-playfair italic font-normal text-[#BFA054]">Pedidos</span></h1>
          <p className="text-[#73185e]/60 text-[11px] uppercase tracking-widest font-bold mt-2">Acompanhe as vendas da NewBeach em tempo real.</p>
        </div>
      </header>

      {/* Orders Filter/Search */}
      <div className="flex bg-white/60 backdrop-blur-sm border border-[#73185e]/10 overflow-hidden rounded-[4px]">
        <div className="flex-1 flex items-center px-6 py-4 border-r border-[#73185e]/10">
          <Search className="w-4 h-4 text-[#73185e]/40 mr-4" />
          <input className="w-full text-[11px] uppercase tracking-widest font-bold outline-none bg-transparent placeholder:text-[#73185e]/30" placeholder="Buscar pedido por ID ou cliente..." />
        </div>
        <div className="hidden md:flex divide-x divide-[#73185e]/10">
          {['Todos', 'Pendentes', 'Pagos', 'Enviados'].map((tab, i) => (
            <button key={tab} className={cn(
              "px-8 py-4 text-[9px] uppercase tracking-widest font-bold transition-all",
              i === 0 ? "bg-[#73185e] text-white" : "text-[#73185e]/60 hover:bg-white/50 hover:text-[#73185e]"
            )}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
           <div className="py-24 text-center font-playfair italic text-[#BFA054] border border-dashed border-[#73185e]/20 rounded-[4px]">Sincronizando vendas...</div>
        ) : orders.map((order) => (
          <div key={order.id} className="bg-white/60 backdrop-blur-sm border border-[#73185e]/10 hover:border-[#73185e]/40 transition-all group relative overflow-hidden rounded-[4px] shadow-sm">
            <div className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 flex-1 w-full">
                <div className="flex flex-col gap-1 min-w-[120px]">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/30">#{order.id.split('-')[0].toUpperCase()}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#73185e]/5 shadow-sm">
                      <User className="w-4 h-4 text-[#73185e]/60" />
                    </div>
                    <div>
                      <h3 className="text-[12px] font-bold tracking-widest text-[#73185e] uppercase line-clamp-1">{order.customer_name}</h3>
                      <p className="text-[9px] text-[#73185e]/40 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 border-y md:border-y-0 md:border-x border-[#73185e]/10 py-4 md:py-0 md:px-12 w-full md:w-auto">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/30">Total</span>
                  <span className="text-xl font-bold tracking-tight text-[#73185e] font-playfair italic">{formatCurrency(order.total_amount)}</span>
                  <span className="text-[9px] text-[#BFA054] font-bold uppercase tracking-widest">{order.items?.length || 0} Itens</span>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/30">Status Local</span>
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-1 text-[8px] uppercase tracking-[0.2em] font-bold border rounded-full w-fit",
                    getStatusColor(order.status)
                  )}>
                    {React.createElement(statusIcons[order.status] || Clock, { className: "w-3 h-3" })}
                    {getStatusLabel(order.status)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-initial">
                  <select 
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    value={order.status}
                    className="w-full bg-white/40 border border-[#73185e]/10 text-[9px] uppercase tracking-widest font-bold px-6 py-4 outline-none focus:ring-1 focus:ring-[#73185e] cursor-pointer appearance-none transition-all pr-12 min-w-[200px] rounded-[2px]"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago / Separar</option>
                    <option value="separando">Separando</option>
                    <option value="enviado">Enviado</option>
                    <option value="concluido">Concluído</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <Clock className="w-3 h-3 text-[#73185e]" />
                  </div>
                </div>
                <button className="p-4 bg-[#73185e] text-white hover:bg-[#5D134B] transition-all rounded-[2px] shadow-lg shadow-[#73185e]/20">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!loading && orders.length === 0 && (
          <div className="bg-white/20 border border-dashed border-[#73185e]/20 flex flex-col items-center justify-center p-24 text-center rounded-[4px]">
             <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-[#73185e]/5">
               <ShoppingBag className="w-4 h-4 text-[#BFA054]" />
             </div>
             <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#73185e]/40">Aguardando primeiro pedido...</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { ShoppingBag } from "lucide-react";
