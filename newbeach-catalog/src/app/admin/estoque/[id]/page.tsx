"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Loader2, CheckCircle, Save, Trash2, Plus, X, Palette } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LinkNext from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Color {
  label: string;
  hex: string;
}

export default function AdminEditarProduto({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [stockStatus, setStockStatus] = useState<'available' | 'sold_out'>('available');
  const [sizes, setSizes] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [colors, setColors] = useState<Color[]>([]);

  // Color input state
  const [newColorLabel, setNewColorLabel] = useState("");
  const [newColorHex, setNewColorHex] = useState("#73185e");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true);
      
      if (catData) setCategories(catData);

      // Fetch Product
      const { data: prodData, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        alert("Erro ao buscar produto: " + error.message);
        router.push("/admin/estoque");
        return;
      }

      if (prodData) {
        setName(prodData.name);
        setDescription(prodData.description || "");
        setPrice(prodData.price.toString());
        setCategoryId(prodData.category_id || "");
        setImageUrls(prodData.images || []);
        setStockStatus(prodData.stock_status);
        setSizes(prodData.sizes || []);
        setMaterials(prodData.materials || []);
        setIsFeatured(prodData.is_featured || false);
        setColors(prodData.colors || []);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [id, router]);

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
        .update({
          name,
          description,
          price: parseFloat(price),
          category_id: categoryId,
          stock_status: stockStatus,
          images: imageUrls,
          sizes,
          materials,
          is_featured: isFeatured,
          colors: colors
        })
        .eq('id', id);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      alert("Erro ao atualizar produto: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta peça permanentemente?")) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      router.push("/admin/estoque");
    } catch (err: any) {
      alert("Erro ao excluir produto: " + err.message);
      setDeleting(false);
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#73185e] animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#BFA054]">Carregando Peça...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <header className="flex justify-between items-start">
        <div>
          <LinkNext href="/admin/estoque" className="flex items-center gap-2 text-[#73185e]/60 hover:text-[#73185e] transition-colors mb-6 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Voltar para o Estoque</span>
          </LinkNext>
          <h1 className="text-4xl font-bold tracking-tighter text-[#73185e]">
            Editar <span className="font-playfair italic font-normal text-[#BFA054]">Peça</span>
          </h1>
          <p className="text-[#73185e]/60 text-[11px] uppercase tracking-widest font-bold mt-2">Atualize as informações técnicas e visuais da peça.</p>
        </div>
        
        <button 
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors text-[9px] uppercase tracking-widest font-bold pt-12"
        >
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Excluir Peça
        </button>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Media (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Galeria de Imagens</label>
            
            <div className="grid grid-cols-2 gap-4">
               {imageUrls.map((url, idx) => (
                 <div key={idx} className="relative aspect-[3/4] bg-white rounded-[2px] overflow-hidden group border border-[#73185e]/5">
                    <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
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

          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/40">Adicionar Link Externo</label>
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
                className="px-4 bg-[#73185e] text-white rounded-[2px]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-8 space-y-12">
          {/* Section 1: Basic Info */}
          <div className="bg-white/40 backdrop-blur-sm p-8 border border-[#73185e]/10 rounded-[4px] space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-2 col-span-full">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Nome do Produto</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 bg-white/60 border border-transparent outline-none focus:ring-1 focus:ring-[#73185e] transition-all text-[11px] uppercase tracking-widest font-bold rounded-[2px]" 
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
                  required
                />
              </div>

              <div className="space-y-2 col-span-full">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Descrição do Produto</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-6 py-4 bg-white/60 border border-transparent outline-none focus:ring-1 focus:ring-[#73185e] transition-all min-h-[140px] text-[11px] font-bold uppercase tracking-widest leading-relaxed rounded-[2px]" 
                  required
                />
              </div>

              <div className="space-y-2 col-span-full">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Destaque na Home?</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsFeatured(true)}
                    className={cn(
                      "flex-1 py-4 text-[10px] uppercase tracking-[0.2em] font-bold border transition-all rounded-[2px]",
                      isFeatured ? "bg-[#BFA054] text-white border-transparent shadow-lg shadow-[#BFA054]/20" : "bg-white/40 text-[#73185e]/40 border-transparent"
                    )}
                  >
                    Sim, em Destaque
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsFeatured(false)}
                    className={cn(
                      "flex-1 py-4 text-[10px] uppercase tracking-[0.2em] font-bold border transition-all rounded-[2px]",
                      !isFeatured ? "bg-[#73185e] text-white border-transparent shadow-lg shadow-[#73185e]/20" : "bg-white/40 text-[#73185e]/40 border-transparent"
                    )}
                  >
                    Não
                  </button>
                </div>
              </div>

              <div className="space-y-2 col-span-full">
                 <label className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">Status de Estoque</label>
                 <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setStockStatus('available')}
                    className={cn(
                      "flex-1 py-4 text-[10px] uppercase tracking-[0.2em] font-bold border transition-all rounded-[2px]",
                      stockStatus === 'available' ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "bg-white/40 text-[#73185e]/40 border-transparent"
                    )}
                  >
                    Disponível
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStockStatus('sold_out')}
                    className={cn(
                      "flex-1 py-4 text-[10px] uppercase tracking-[0.2em] font-bold border transition-all rounded-[2px]",
                      stockStatus === 'sold_out' ? "bg-[#73185e] text-white border-transparent" : "bg-white/40 text-[#73185e]/40 border-transparent"
                    )}
                  >
                    Sold Out (Esgotado)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Colors */}
          <div className="bg-white/40 backdrop-blur-sm p-8 border border-[#73185e]/10 rounded-[4px] space-y-8">
             <div className="flex items-center gap-4 border-b border-[#73185e]/5 pb-4">
                <Palette className="w-5 h-5 text-[#BFA054]" />
                <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#73185e]">Cores e Variações</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">Nome da Cor</label>
                      <input 
                        value={newColorLabel}
                        onChange={(e) => setNewColorLabel(e.target.value)}
                        className="w-full px-4 py-3 bg-white/60 border border-transparent outline-none focus:ring-1 focus:ring-[#73185e] text-[10px] uppercase font-bold tracking-widest rounded-[2px]" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">Tom da Cor</label>
                      <div className="flex gap-4">
                         <input 
                           type="color" 
                           value={newColorHex}
                           onChange={(e) => setNewColorHex(e.target.value)}
                           className="w-16 h-12 bg-transparent border-none p-0 cursor-pointer rounded-[2px]"
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

                <div className="flex flex-wrap gap-3 content-start">
                   {colors.map((color, idx) => (
                     <div key={idx} className="flex items-center gap-2 pl-2 pr-1 py-1 bg-white rounded-[2px] border border-[#73185e]/5 shadow-sm group">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.hex }} />
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

          <div className="pt-12 flex justify-between items-center border-t border-[#73185e]/5">
             <AnimatePresence>
               {success && (
                 <motion.div 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0 }}
                   className="flex items-center gap-2 text-emerald-600 text-[10px] uppercase tracking-widest font-bold"
                 >
                    <CheckCircle className="w-4 h-4" /> Peça Atualizada com Sucesso
                 </motion.div>
               )}
             </AnimatePresence>
            
            <button 
              type="submit"
              disabled={saving || uploading}
              className="px-16 py-5 bg-[#73185e] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#5D134B] transition-all flex items-center gap-4 shadow-xl shadow-[#73185e]/20 rounded-[2px] ml-auto"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
