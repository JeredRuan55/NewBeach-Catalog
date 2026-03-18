"use client";

import React, { useEffect, useState } from "react";
import { Search, Eye, User, Clock, CheckCircle2, Package, Truck, Loader2, XCircle, AlertCircle, X, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, getStatusLabel, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Order {
  id: string;
  customer_name: string;
  total_amount: number;
  status: 'pendente' | 'pago' | 'separando' | 'enviado' | 'concluido' | 'cancelado';
  created_at: string;
  items: any[];
  cancellation_reason?: string;
}

export default function AdminPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (newStatus === 'cancelado') {
      setSelectedOrderId(id);
      setIsCancelModalOpen(true);
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
    }
  };

  const confirmCancellation = async () => {
    if (!selectedOrderId || !cancelReason.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelado',
        cancellation_reason: cancelReason 
      })
      .eq('id', selectedOrderId);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === selectedOrderId ? { 
        ...o, 
        status: 'cancelado', 
        cancellation_reason: cancelReason 
      } : o));
      setIsCancelModalOpen(false);
      setCancelReason("");
      setSelectedOrderId(null);
    }
    setIsSubmitting(false);
  };

  const openDetails = (order: Order) => {
    setViewingOrder(order);
    setIsDetailsModalOpen(true);
  };

  const statusIcons: Record<string, any> = {
    pendente: Clock,
    pago: CheckCircle2,
    separando: Package,
    enviado: Truck,
    concluido: CheckCircle2,
    cancelado: XCircle,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-amber-50 text-amber-600 border-amber-100',
      pago: 'bg-green-50 text-green-600 border-green-100',
      separando: 'bg-blue-50 text-blue-600 border-blue-100',
      enviado: 'bg-purple-50 text-purple-600 border-purple-100',
      concluido: 'bg-zinc-100 text-zinc-500 border-zinc-200',
      cancelado: 'bg-rose-50 text-rose-600 border-rose-100',
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
          <div key={order.id} className={cn(
            "bg-white/60 backdrop-blur-sm border transition-all group relative overflow-hidden rounded-[4px] shadow-sm",
            order.status === 'cancelado' ? "border-rose-200/50 opacity-80" : "border-[#73185e]/10 hover:border-[#73185e]/40"
          )}>
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

                {order.status === 'cancelado' && order.cancellation_reason && (
                  <div className="bg-rose-50/50 p-4 rounded border border-rose-100 flex-1 w-full md:w-auto">
                    <p className="text-[8px] uppercase tracking-widest font-bold text-rose-500 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Motivo do Cancelamento
                    </p>
                    <p className="text-[11px] text-[#73185e]/80 italic font-bold uppercase tracking-widest leading-relaxed">
                      "{order.cancellation_reason}"
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2 flex-1 border-l border-[#73185e]/10 pl-12">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/30">Pagamento</span>
                  {(order as any).payment_method === 'pix' ? (
                    <div className="flex items-center gap-2 text-[#BFA054]">
                       <QrCode className="w-4 h-4" />
                       <span className="text-[9px] uppercase tracking-widest font-bold">PIX Direto</span>
                    </div>
                  ) : (
                    <span className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60 italic font-normal">WhatsApp</span>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1 border-l border-[#73185e]/10 pl-12 hidden md:flex">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/30">Destino</span>
                  {(order as any).shipping_address ? (
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase font-bold text-[#73185e]">{(order as any).shipping_address.localidade}/{(order as any).shipping_address.uf}</p>
                      <p className="text-[8px] text-[#73185e]/40 font-bold tracking-widest uppercase truncate max-w-[150px]">
                        {(order as any).shipping_address.logradouro}
                      </p>
                    </div>
                  ) : (
                    <span className="text-[9px] uppercase font-bold text-[#73185e]/40 italic font-normal">Não informado</span>
                  )}
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
                    <option value="cancelado">CANCELAR PEDIDO</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <Clock className="w-3 h-3 text-[#73185e]" />
                  </div>
                </div>
                {order.status !== 'cancelado' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'cancelado')}
                    className="p-4 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all rounded-[2px] border border-rose-200"
                    title="Cancelar Pedido"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                 <button 
                  onClick={() => openDetails(order)}
                  className="p-4 bg-[#73185e] text-white hover:bg-[#5D134B] transition-all rounded-[2px] shadow-lg shadow-[#73185e]/20" 
                  title="Ver Detalhes"
                >
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

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#D1C0DB] w-full max-w-md p-8 rounded shadow-2xl border border-white/20 relative"
          >
            <button 
              onClick={() => setIsCancelModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#73185e]/40 hover:text-[#73185e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <header className="mb-8">
              <h2 className="text-2xl font-bold tracking-tighter text-[#73185e]">Cancelar <span className="font-playfair italic font-normal text-[#BFA054]">Pedido</span></h2>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]/60 mt-2">Explique por que esta joia não será entregue.</p>
            </header>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Motivo do Cancelamento</label>
              <textarea 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ex: Produto com defeito no lote, cliente desistiu, erro no estoque..."
                className="w-full bg-white/60 border border-[#73185e]/10 p-6 min-h-[120px] outline-none focus:ring-1 focus:ring-rose-400 text-[11px] font-bold uppercase tracking-widest rounded-[2px] transition-all"
              />
            </div>

            <div className="mt-10 flex gap-4">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-4 text-[10px] uppercase tracking-widest font-bold text-[#73185e]/60 hover:text-[#73185e] transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={confirmCancellation}
                disabled={isSubmitting || !cancelReason.trim()}
                className="flex-[2] py-4 bg-rose-600 text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 rounded-[2px] flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Cancelamento"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && viewingOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl p-8 rounded shadow-2xl border border-[#73185e]/10 relative max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#73185e]/40 hover:text-[#73185e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <header className="mb-8 border-b border-[#73185e]/5 pb-6">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#BFA054] mb-2">
                <CheckCircle2 className="w-4 h-4" /> Pedido #{(viewingOrder.id.split('-')[0]).toUpperCase()}
              </div>
              <h2 className="text-3xl font-bold tracking-tighter text-[#73185e]">Detalhes da <span className="font-playfair italic font-normal text-[#BFA054]">Reserva</span></h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Items Section */}
              <div className="space-y-6">
                <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#73185e]">Itens do Pedido</h3>
                <div className="space-y-4">
                  {viewingOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-center bg-[#73185e]/5 p-3 rounded-[2px]">
                      <div className="w-12 h-16 bg-white overflow-hidden flex-shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-[#73185e] uppercase tracking-wider">{item.name}</p>
                        <div className="flex gap-3 text-[9px] text-[#73185e]/60 font-medium uppercase mt-1">
                          {item.color && <span>Cor: {item.color}</span>}
                          {item.size && <span>Tam: {item.size}</span>}
                        </div>
                        <p className="text-[10px] font-bold text-[#BFA054] mt-1">{item.quantity}x {formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-[#73185e]/5">
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#73185e]">
                      <span>Valor Total</span>
                      <span className="text-xl font-playfair italic text-[#BFA054]">{formatCurrency(viewingOrder.total_amount)}</span>
                   </div>
                </div>
              </div>

              {/* Customer Info Section */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#73185e]">Cliente</h3>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#73185e] uppercase tracking-widest">{viewingOrder.customer_name}</p>
                    <p className="text-[10px] text-[#73185e]/60 font-medium tracking-wider">{(viewingOrder as any).customer_email}</p>
                    <p className="text-[10px] font-bold text-[#BFA054] tracking-widest">{(viewingOrder as any).customer_whatsapp}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#73185e]">Entrega</h3>
                  {(viewingOrder as any).shipping_address ? (
                    <div className="text-[10px] text-[#73185e] space-y-1 uppercase font-bold tracking-widest leading-relaxed">
                      <p>{(viewingOrder as any).shipping_address.logradouro}, {(viewingOrder as any).shipping_address.numero}</p>
                      <p>{(viewingOrder as any).shipping_address.complemento}</p>
                      <p>{(viewingOrder as any).shipping_address.bairro}</p>
                      <p>{(viewingOrder as any).shipping_address.cidade} - {(viewingOrder as any).shipping_address.uf}</p>
                      <p className="text-[#BFA054]">CEP: {(viewingOrder as any).shipping_address.cep}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] italic text-[#73185e]/40 font-bold uppercase tracking-widest">Entrega a combinar via WhatsApp</p>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-[#73185e]/5">
                   <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#73185e]">Pagamento</h3>
                   <div className="flex items-center gap-3">
                      {(viewingOrder as any).payment_method === 'pix' ? (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                           <QrCode className="w-4 h-4" />
                           <span className="text-[9px] uppercase tracking-widest font-bold">PIX DIRETO (PAGO)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#73185e]/60 bg-[#73185e]/5 px-4 py-2 rounded-full border border-[#73185e]/10">
                           <User className="w-4 h-4" />
                           <span className="text-[9px] uppercase tracking-widest font-bold">WHATSAPP / A COMBINAR</span>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
               <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-full py-5 bg-[#73185e] text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#5D134B] transition-all"
               >
                 Fechar Detalhes
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import { ShoppingBag } from "lucide-react";
