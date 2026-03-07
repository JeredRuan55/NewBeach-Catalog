"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, Megaphone, Loader2, X, Camera, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  banner_url: string;
  discount_percentage: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export default function AdminCampanhas() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [discount, setDiscount] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setCampaigns(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data, error } = await supabase
      .from('campaigns')
      .insert([
        {
          title,
          subtitle,
          banner_url: bannerUrl,
          discount_percentage: parseInt(discount) || 0,
          starts_at: startsAt || null,
          ends_at: endsAt || null,
          is_active: true
        }
      ])
      .select();

    if (!error && data) {
      setCampaigns([data[0], ...campaigns]);
      setIsModalOpen(false);
      resetForm();
    } else {
      alert("Erro ao criar campanha: " + error?.message);
    }
    setSaving(false);
  };

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setBannerUrl("");
    setDiscount("");
    setStartsAt("");
    setEndsAt("");
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('campaigns')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      setCampaigns(campaigns.map(c => 
        c.id === id ? { ...c, is_active: !currentStatus } : c
      ));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta campanha permanentemente?")) return;
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (!error) setCampaigns(campaigns.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-12 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-medium tracking-tighter">Módulo de <span className="font-playfair italic">Campanhas</span></h1>
          <p className="text-[#5A5A5A] text-sm mt-2">Banners, promoções e descontos sazonais na NewBeach.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Criar Campanha
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
             <div className="col-span-full py-24 text-center font-playfair italic text-[#8A8A8A]">Sincronizando promoções...</div>
        ) : campaigns.map((camp) => (
          <div key={camp.id} className="bg-white border border-[#E5E1D8] group relative overflow-hidden transition-all hover:border-black">
            <div className="aspect-video bg-[#F5F5F0] overflow-hidden">
               {camp.banner_url ? (
                  <img src={camp.banner_url} alt={camp.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10">
                    <Megaphone className="w-12 h-12" />
                  </div>
               )}
            </div>
            
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-start">
                <button 
                  onClick={() => toggleStatus(camp.id, camp.is_active)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-1 text-[10px] uppercase tracking-widest font-bold border transition-all",
                    camp.is_active ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-200"
                  )}
                >
                  <Megaphone className="w-3 h-3" /> {camp.is_active ? "Ativa" : "Inativa"}
                </button>
                {camp.discount_percentage > 0 && (
                   <span className="text-[10px] uppercase tracking-widest font-bold text-rose-500 bg-rose-50 px-3 py-1 border border-rose-100">
                     -{camp.discount_percentage}% OFF
                   </span>
                )}
              </div>
              
              <h3 className="text-xl font-medium tracking-tight uppercase leading-tight">{camp.title}</h3>
              <p className="text-sm text-[#5A5A5A] leading-relaxed line-clamp-2">{camp.subtitle}</p>
              
              <div className="pt-6 grid grid-cols-2 gap-4 border-t border-[#F0EFEA] text-[9px] uppercase tracking-widest text-[#8A8A8A] font-medium">
                <div>
                  <span className="block mb-1">Início</span>
                  <span className="text-black font-bold">{camp.starts_at ? new Date(camp.starts_at).toLocaleDateString('pt-BR') : 'Imediato'}</span>
                </div>
                <div>
                  <span className="block mb-1">Término</span>
                  <span className="text-black font-bold">{camp.ends_at ? new Date(camp.ends_at).toLocaleDateString('pt-BR') : 'Indeterminado'}</span>
                </div>
              </div>
            </div>

            {/* Actions Hover Layer */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-black/5 opacity-0 group-hover:opacity-100 transition-all flex justify-end gap-3 backdrop-blur-sm">
              <button className="p-3 bg-white text-black hover:bg-gray-100 transition-colors shadow-sm"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(camp.id)} className="p-3 bg-white text-red-500 hover:bg-red-50 transition-colors shadow-sm"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}

        {!loading && campaigns.length === 0 && (
          <div className="col-span-full bg-[#FAF9F6] border border-dashed border-[#D2CDC3] flex flex-col items-center justify-center p-24 text-center group hover:bg-[#F5F4F0] transition-colors cursor-pointer min-h-[300px]" onClick={() => setIsModalOpen(true)}>
             <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm border border-[#E5E1D8]">
               <Plus className="w-5 h-5 text-[#8A8A8A]" />
             </div>
             <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8A8A8A]">Agendar Primeira Promoção</p>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="bg-white border border-[#E5E1D8] w-full max-w-2xl p-10 shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-medium tracking-tighter">Criar <span className="font-playfair italic">Campanha</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8A8A8A] hover:text-black mt-[-20px]"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 md:col-span-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A8A8A]">Título da Campanha</label>
                  <input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Winter Sale 2026"
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E5E1D8] outline-none focus:ring-1 focus:ring-black text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A8A8A]">Subtítulo / Chamada</label>
                  <textarea 
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ex: Até 50% OFF em todas as peças de Linho Puro."
                    className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E5E1D8] outline-none focus:ring-1 focus:ring-black text-sm min-h-[80px]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A8A8A]">URL do Banner (Ideal 16:9)</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input 
                      type="url"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://exemplo.com/banner.jpg"
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E5E1D8] outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                  </div>
                  <div className="w-16 h-12 bg-gray-50 border border-[#E5E1D8] flex items-center justify-center overflow-hidden">
                    {bannerUrl ? <img src={bannerUrl} className="w-full h-full object-cover" /> : <Camera className="w-4 h-4 text-[#DDD]" />}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A8A8A]">Desconto Máximo (%)</label>
                <input 
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="Ex: 30"
                  className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E5E1D8] outline-none focus:ring-1 focus:ring-black text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A8A8A]">Data de Início</label>
                    <input 
                      type="date"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E5E1D8] outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#8A8A8A]">Data de Término</label>
                    <input 
                      type="date"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E5E1D8] outline-none focus:ring-1 focus:ring-black text-sm"
                    />
                 </div>
              </div>

              <div className="pt-4 md:col-span-2">
                <button 
                  disabled={saving}
                  className="w-full py-5 bg-black text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Agendar Campanha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
