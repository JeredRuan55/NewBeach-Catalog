"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Loader2, CheckCircle, Plus, X, Palette } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LinkNext from "next/link";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Color {
  label: string;
  hex: string;
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [stockStatus, setStockStatus] = useState<'available' | 'sold_out'>('available');
  const [sizes, setSizes] = useState<string[]>(["P", "M", "G"]);
  const [materials, setMaterials] = useState<string[]>(["Linho 100%"]);
  const [colors, setColors] = useState<Color[]>([]);
  
  // Color input state
  const [newColorLabel, setNewColorLabel] = useState("");
  const [newColorHex, setNewColorHex] = useState("#73185e");

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

  const addColor = () => {
    if (!newColorLabel) return;
    setColors([...colors, { label: newColorLabel, hex: newColorHex }]);
    setNewColorLabel("");
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

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
            images: imageUrls,
            sizes,
            materials,
            colors,
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('newbeach-assets')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('newbeach-assets')
        .getPublicUrl(filePath);

      setImageUrls([...imageUrls, publicUrl]);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert("Erro no upload. Tente usar um link externo.");
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
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Media (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Galeria de Imagens</label>
            
            <div className="grid grid-cols-2 gap-4">
               {imageUrls.map((url, idx) => (
                 <div key={idx} className="relative aspect-[3/4] bg-white rounded-[2px] overflow-hidden group border border-[#73185e]/5">
                    <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                 </div>
               ))}
               
               <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-[3/4] border-2 border-dashed border-[#73185e]/10 bg-white/40 flex flex-col items-center justify-center gap-2 hover:border-[#73185e]/30 transition-all rounded-[2px] group"
               >
                 {uploading ? (
                   <Loader2 className="w-6 h-6 text-[#73185e] animate-spin" />
                 ) : (
                   <>
                     <Camera className="w-6 h-6 text-[#73185e]/20 group-hover:scale-110 transition-transform" />
                     <span className="text-[8px] uppercase tracking-widest font-bold text-[#73185e]/40">Adicionar Foto</span>
                   </>
                 )}
               </button>
            </div>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Quick External Link */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/40">Link Externo Direto</label>
            <div className="flex gap-2">
              <input 
                id="external-url"
                type="url" 
                placeholder="https://..."
                className="flex-1 px-4 py-3 bg-white/60 border border-[#73185e]/10 outline-none focus:ring-1 focus:ring-[#73185e] text-[10px] uppercase font-bold tracking-widest rounded-[2px]"
              />
              <button 
                type="button"
                onClick={() => {
                  const input = document.getElementById("external-url") as HTMLInputElement;
                  if (input.value) {
                    setImageUrls([...imageUrls, input.value]);
                    input.value = "";
                  }
                }}
                className="px-4 bg-[#73185e] text-white rounded-[2px] transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details (8 cols) */}
        <div className="lg:col-span-8 space-y-12">
          {/* Section 1: Basic Info */}
          <div className="bg-white/40 backdrop-blur-sm p-8 border border-[#73185e]/10 rounded-[4px] space-y-8">
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
             </div>
          </div>

          {/* Section 2: Colors & Variations */}
          <div className="bg-white/40 backdrop-blur-sm p-8 border border-[#73185e]/10 rounded-[4px] space-y-8">
             <div className="flex items-center gap-4 border-b border-[#73185e]/5 pb-4">
                <Palette className="w-5 h-5 text-[#BFA054]" />
                <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#73185e]">Cores e Variações</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Add Color UI */}
                <div className="space-y-6">
                   <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                         <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">Nome da Cor</label>
                         <input 
                           value={newColorLabel}
                           onChange={(e) => setNewColorLabel(e.target.value)}
                           className="w-full px-4 py-3 bg-white/60 border border-transparent outline-none focus:ring-1 focus:ring-[#73185e] text-[10px] uppercase font-bold tracking-widest rounded-[2px]" 
                           placeholder="Ex: Cru, Preto, Terracota"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">Selecione o Tom</label>
                         <div className="flex gap-4">
                            <input 
                              type="color" 
                              value={newColorHex}
                              onChange={(e) => setNewColorHex(e.target.value)}
                              className="w-16 h-12 bg-transparent border-none p-0 cursor-pointer overflow-hidden rounded-[2px]"
                            />
                            <button 
                              type="button"
                              onClick={addColor}
                              className="flex-1 bg-[#73185e] text-white text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-[#5D134B] transition-all rounded-[2px]"
                            >
                              Adicionar Cor
                            </button>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Colors List */}
                <div className="space-y-4">
                   <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">Cores Ativas</label>
                   <div className="flex flex-wrap gap-3">
                      {colors.length === 0 && (
                        <p className="text-[10px] text-[#73185e]/30 italic font-bold uppercase tracking-widest">Nenhuma cor selecionada</p>
                      )}
                      {colors.map((color, idx) => (
                        <div key={idx} className="flex items-center gap-2 pl-2 pr-1 py-1 bg-white rounded-[2px] border border-[#73185e]/5 shadow-sm group animate-in fade-in slide-in-from-left-2 duration-300">
                           <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color.hex }} />
                           <span className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">{color.label}</span>
                           <button 
                            type="button"
                            onClick={() => removeColor(idx)}
                            className="p-1 hover:bg-rose-50 text-[#73185e]/20 hover:text-rose-500 rounded-full transition-colors"
                           >
                             <X className="w-3 h-3" />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-6 items-center">
             <button 
               type="button"
               onClick={() => router.push("/admin/estoque")}
               className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#73185e]/40 hover:text-[#73185e] transition-colors"
             >
               Cancelar
             </button>
             <button 
                type="submit"
                disabled={saving || uploading}
                className="px-20 py-6 bg-[#73185e] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#5D134B] transition-all flex items-center gap-4 shadow-xl shadow-[#73185e]/20 rounded-[2px]"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar Peça"}
              </button>
          </div>
        </div>
      </form>
    </div>
  );
}
