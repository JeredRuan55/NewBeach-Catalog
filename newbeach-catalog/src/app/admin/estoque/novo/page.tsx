"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LinkNext from "next/link";

interface Category {
  id: string;
  name: string;
}

export default function AdminNovoProduto() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stockStatus, setStockStatus] = useState<'available' | 'sold_out'>('available');
  const [sizes, setSizes] = useState<string[]>(["P", "M", "G"]);
  const [materials, setMaterials] = useState<string[]>(["Linho 100%"]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true);
      
      if (data) setCategories(data);
      setLoadingCategories(false);
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert([
          {
            name,
            description,
            price: parseFloat(price),
            category_id: categoryId,
            stock_status: stockStatus,
            images: imageUrl ? [imageUrl] : [],
            sizes,
            materials,
          },
        ]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/estoque");
      }, 2000);
    } catch (err: any) {
      alert("Erro ao salvar produto: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Create a unique name for the file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload the file to 'newbeach-assets' bucket
      const { data, error } = await supabase.storage
        .from('newbeach-assets')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('newbeach-assets')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      // Fallback for missing bucket/RLS
      alert("Aviso: Upload direto bloqueado ou balde não configurado. Por favor, use um link externo por enquanto ou configure o storage 'newbeach-assets' como público no Supabase.");
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500 bg-[#D1C0DB]">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl shadow-[#73185e]/10">
          <CheckCircle className="w-10 h-10 text-[#73185e]" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold tracking-tighter text-[#73185e]">Peça Publicada!</h2>
          <p className="text-[#73185e]/60 text-[11px] uppercase tracking-widest font-bold">A NewBeach acaba de ganhar uma nova joia no catálogo.</p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold pt-8 text-[#BFA054] animate-pulse">Redirecionando para o estoque...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <header>
        <LinkNext href="/admin/estoque" className="flex items-center gap-2 text-[#73185e]/60 hover:text-[#73185e] transition-colors mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Voltar para o Estoque</span>
        </LinkNext>
        <h1 className="text-4xl font-bold tracking-tighter text-[#73185e]">
          Cadastrar <span className="font-playfair italic font-normal text-[#BFA054]">Nova Peça</span>
        </h1>
        <p className="text-[#73185e]/60 text-[11px] uppercase tracking-widest font-bold mt-2">Preencha os detalhes técnicos da peça NewBeach.</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Media */}
        <div className="lg:col-span-1 space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Imagem da Peça</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] bg-white/60 backdrop-blur-sm border-2 border-dashed border-[#73185e]/10 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden group rounded-[4px] cursor-pointer hover:border-[#73185e]/30 transition-all"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-4">
                   <Loader2 className="w-8 h-8 text-[#73185e] animate-spin" />
                   <p className="text-[9px] uppercase tracking-[0.2em] text-[#73185e] font-bold">Subindo foto...</p>
                </div>
              ) : imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-[#73185e]/20 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#73185e]/30 font-bold">Clique para carregar foto<br/>ou cole o link abaixo</p>
                </>
              )}
            </div>
            
            {/* Hidden File Input */}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="space-y-2">
              <input 
                type="url" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Cole o link da foto aqui se preferir"
                className="w-full px-4 py-3 bg-white/60 border border-[#73185e]/10 outline-none focus:ring-1 focus:ring-[#73185e] text-[11px] font-bold uppercase tracking-widest placeholder:text-[#73185e]/20 rounded-[2px]"
              />
              <p className="text-[9px] text-[#73185e]/40 pt-1 italic font-bold uppercase tracking-widest leading-relaxed">
                Suporte para JPG, PNG e WebP. Recomenda-se o formato 3:4.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-8 bg-white/40 backdrop-blur-sm p-8 border border-[#73185e]/10 rounded-[4px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-2 col-span-full">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Nome do Produto</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 bg-white/60 border border-transparent outline-none focus:ring-1 focus:ring-[#73185e] transition-all text-[11px] uppercase tracking-widest font-bold placeholder:text-[#73185e]/20 rounded-[2px]" 
                placeholder="Ex: Vestido Midi Linho Cru"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Categoria</label>
              <select 
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-6 py-4 bg-white/60 border border-transparent outline-none focus:ring-1 focus:ring-[#73185e] transition-all appearance-none cursor-pointer text-[11px] uppercase tracking-widest font-bold text-[#73185e] rounded-[2px]"
                required
              >
                <option value="">Selecione...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Preço de Venda (R$)</label>
              <input 
                type="number" 
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-6 py-4 bg-white/60 border border-transparent outline-none focus:ring-1 focus:ring-[#73185e] transition-all text-[11px] font-bold text-[#BFA054] rounded-[2px]" 
                placeholder="489.90"
                required
              />
            </div>

            <div className="space-y-2 col-span-full">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Descrição do Produto</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-6 py-4 bg-white/60 border border-transparent outline-none focus:ring-1 focus:ring-[#73185e] transition-all min-h-[140px] text-[11px] font-bold uppercase tracking-widest leading-relaxed placeholder:text-[#73185e]/20 rounded-[2px]" 
                placeholder="Descreva o caimento, detalhes do tecido e estilo..."
                required
              />
            </div>

            <div className="space-y-2 col-span-full">
              <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Status Inicial</label>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStockStatus('available')}
                  className={cn(
                    "flex-1 py-4 text-[10px] uppercase tracking-[0.2em] font-bold border transition-all rounded-[2px]",
                    stockStatus === 'available' ? "bg-[#73185e] text-white border-transparent shadow-lg shadow-[#73185e]/20" : "bg-white/40 text-[#73185e]/40 border-transparent"
                  )}
                >
                  Disponível
                </button>
                <button 
                  type="button"
                  onClick={() => setStockStatus('sold_out')}
                  className={cn(
                    "flex-1 py-4 text-[10px] uppercase tracking-[0.2em] font-bold border transition-all rounded-[2px]",
                    stockStatus === 'sold_out' ? "bg-[#73185e] text-white border-transparent shadow-lg shadow-[#73185e]/20" : "bg-white/40 text-[#73185e]/40 border-transparent"
                  )}
                >
                  Sold Out
                </button>
              </div>
            </div>
          </div>

          <div className="pt-12 flex justify-end">
            <button 
              type="submit"
              disabled={saving || uploading}
              className="px-16 py-5 bg-[#73185e] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#5D134B] transition-all flex items-center gap-4 shadow-xl shadow-[#73185e]/20 rounded-[2px]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar no Catálogo"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

import { cn } from "@/lib/utils";
