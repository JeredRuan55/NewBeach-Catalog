"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Power, PowerOff, Star } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import LinkNext from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
  stock_status: 'available' | 'sold_out';
  images: string[];
  is_featured: boolean;
  categories?: { name: string };
}

export default function AdminEstoque() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)');
    
    if (data) setProducts(data);
    setLoading(false);
  };

  const toggleStock = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'sold_out' : 'available';
    const { error } = await supabase
      .from('products')
      .update({ stock_status: newStatus })
      .eq('id', id);

    if (!error) {
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, stock_status: newStatus as any } : p
      ));
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const { error } = await supabase
      .from('products')
      .update({ is_featured: newStatus })
      .eq('id', id);

    if (!error) {
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, is_featured: newStatus } : p
      ));
    }
  };

  return (
    <div className="space-y-12 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-[#73185e]">Estoque & <span className="font-playfair italic font-normal text-[#BFA054]">Peças</span></h1>
          <p className="text-[#73185e]/60 text-[11px] uppercase tracking-widest font-bold mt-2">Gerencie seu inventário premium em tempo real.</p>
        </div>
        <LinkNext 
          href="/admin/estoque/novo"
          className="flex items-center gap-3 bg-[#73185e] text-white px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#5D134B] transition-all shadow-lg shadow-[#73185e]/20 rounded-[4px]"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </LinkNext>
      </header>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 border border-[#73185e]/10 rounded-[4px]">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#73185e]/40" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou categoria..." 
            className="w-full pl-12 pr-4 py-3 bg-white/40 border-none text-[11px] uppercase tracking-widest font-bold placeholder:text-[#73185e]/30 focus:ring-1 focus:ring-[#73185e] outline-none transition-all rounded-[2px]"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 border border-[#73185e]/10 text-[10px] uppercase tracking-widest font-bold text-[#73185e] hover:bg-white/50 transition-all rounded-[2px]">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <section className="bg-white/60 backdrop-blur-sm border border-[#73185e]/10 overflow-hidden rounded-[4px] shadow-sm">
        {loading ? (
          <div className="p-24 text-center text-[#BFA054] font-playfair italic">Buscando curadoria...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#73185e]/5 border-b border-[#73185e]/10 text-[9px] uppercase tracking-[0.2em] font-bold text-[#73185e]">
                <th className="px-8 py-5">Peça</th>
                <th className="px-8 py-5">Categoria</th>
                <th className="px-8 py-5">Preço</th>
                <th className="px-8 py-5 text-center">Home/Destaque</th>
                <th className="px-8 py-5">Venda Ativa</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#73185e]/10">
              {products.map((p) => (
                <tr key={p.id} className="group hover:bg-white/40 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-16 bg-white flex items-center justify-center p-1 shadow-sm border border-[#73185e]/5">
                        {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" /> : <div className="text-[8px] text-[#BFA054] font-serif">NB</div>}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-widest font-bold text-[#73185e]">{p.name}</span>
                        {p.is_featured && <span className="text-[8px] text-[#BFA054] uppercase tracking-widest font-bold mt-1">★ Em Destaque</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]/60">{p.categories?.name || '---'}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[12px] font-playfair italic font-bold text-[#BFA054]">{formatCurrency(p.price)}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => toggleFeatured(p.id, p.is_featured)}
                      className={cn(
                        "p-3 rounded-full border transition-all inline-flex",
                        p.is_featured ? "bg-[#BFA054]/10 border-[#BFA054]/30 text-[#BFA054]" : "border-[#73185e]/5 text-[#73185e]/20 hover:text-[#73185e]/40"
                      )}
                    >
                      <Star className={cn("w-4 h-4", p.is_featured && "fill-current")} />
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleStock(p.id, p.stock_status)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 text-[9px] uppercase tracking-[0.2em] font-bold border transition-all rounded-[2px]",
                        p.stock_status === 'available' 
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
                          : "border-[#73185e]/10 bg-white/20 text-[#73185e]/30 hover:bg-white/40"
                      )}
                    >
                      {p.stock_status === 'available' ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                      {p.stock_status === 'available' ? 'Ativo' : 'Esgotado'}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-[#73185e]/40 hover:text-[#73185e] transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-24 text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#BFA054] mb-2">Curadoria Vazia</div>
                    <p className="text-[#73185e]/40 text-[11px] uppercase tracking-widest font-bold">O seu banco de dados está pronto para novas peças.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
