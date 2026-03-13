"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShoppingBag, Check, Share2, Ruler, Palette, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { formatCurrency, cn } from "@/lib/utils";
import LinkNext from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  colors?: { label: string; hex: string; imageUrl?: string; isAvailable?: boolean }[];
  sizes?: { label: string; isAvailable?: boolean }[];
  materials?: string[];
  stock_status: 'available' | 'sold_out';
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setProduct(data);
        setSelectedImage(data.images?.[0] || "");
        
        // Auto-select first available color
        const firstAvailableColor = data.colors?.find((c: any) => c.isAvailable !== false);
        if (firstAvailableColor) {
           setSelectedColor(firstAvailableColor.label);
           if (firstAvailableColor.imageUrl) setSelectedImage(firstAvailableColor.imageUrl);
        }
        
        // Auto-select first available size
        const firstAvailableSize = data.sizes?.find((s: any) => s.isAvailable !== false);
        if (firstAvailableSize) setSelectedSize(firstAvailableSize.label);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert("Por favor, selecione uma cor.");
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Por favor, selecione um tamanho.");
      return;
    }

    setAdding(true);
    
    // Create direct URL or use selected image for cart
    const cartImage = (product.colors?.find(c => c.label === selectedColor)?.imageUrl) || product.images[0];
    
    // Composite ID to allow multiple variations of the same product
    const compositeId = `${product.id}-${selectedColor || 'any'}-${selectedSize || 'any'}`;

    addItem({
      id: compositeId,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: cartImage,
      quantity: 1,
      color: selectedColor || undefined,
      size: selectedSize || undefined
    });

    setTimeout(() => {
       setAdding(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 text-[#73185e] animate-spin mb-4" />
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#BFA054]">Preparando Peça...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 text-center">
          <h2 className="text-2xl font-bold text-[#73185e] mb-4">Peça não encontrada</h2>
          <LinkNext href="/colecoes" className="text-[10px] uppercase tracking-widest font-bold text-[#BFA054] underline">
            Voltar para Coleções
          </LinkNext>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#73185e]/5">
         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 group">
               <ChevronLeft className="w-4 h-4 text-[#73185e] group-hover:-translate-x-1 transition-transform" />
               <span className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]">Voltar</span>
            </button>
            <div className="text-[11px] font-bold tracking-[0.3em] text-[#73185e]">NEWBEACH <span className="text-[#BFA054]">EXCLUSIVO</span></div>
            <button className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-[#73185e]/40">
               <Share2 className="w-4 h-4" />
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
            
            {/* Gallery Section */}
            <div className="lg:col-span-1 hidden lg:flex flex-col gap-4">
               {product.images.map((img, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setSelectedImage(img)}
                   className={cn(
                     "aspect-[3/4] border transition-all overflow-hidden",
                     selectedImage === img ? "border-[#73185e]" : "border-transparent opacity-50 grayscale hover:opacity-100"
                   )}
                 >
                    <img src={img} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>

            <div className="lg:col-span-6 space-y-4">
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-50">
                   <AnimatePresence mode="wait">
                      <motion.img 
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        src={selectedImage} 
                        className="w-full h-full object-cover" 
                      />
                   </AnimatePresence>
                   
                   {product.stock_status === 'sold_out' && (
                     <div className="absolute top-8 left-8 bg-[#73185e] text-white text-[10px] uppercase tracking-[0.3em] font-bold px-6 py-2 shadow-2xl">
                        Esgotado
                     </div>
                   )}
                </div>
                {/* Mobile Thumbnails */}
                <div className="flex lg:hidden gap-3 overflow-x-auto pb-4 pt-2">
                   {product.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        "w-20 aspect-[3/4] flex-shrink-0 border transition-all overflow-hidden",
                        selectedImage === img ? "border-[#73185e]" : "border-transparent opacity-60"
                      )}
                    >
                        <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
            </div>

            {/* Content Section */}
            <div className="lg:col-span-5 space-y-12">
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-bold text-[#BFA054] px-3 py-1 bg-[#BFA054]/5 rounded-sm">Premium Selection</span>
                     <span className="w-8 h-[1px] bg-[#73185e]/10"></span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-[#73185e] font-playfair">{product.name}</h1>
                  <p className="text-xl md:text-2xl font-bold text-[#BFA054] font-playfair italic">{formatCurrency(product.price)}</p>
               </div>

               <div className="space-y-6 text-[11px] leading-relaxed text-[#73185e]/70 uppercase tracking-widest font-medium">
                  <p>{product.description}</p>
                  {product.materials && product.materials.length > 0 && (
                     <div className="pt-4 flex flex-wrap gap-4">
                        {product.materials.map((m, i) => (
                           <span key={i} className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-[#BFA054]"></span>
                              {m}
                           </span>
                        ))}
                     </div>
                  )}
               </div>

               {/* Variations */}
               <div className="space-y-10 py-10 border-y border-[#73185e]/5">
                  
                  {/* Colors */}
                  {product.colors && product.colors.length > 0 && (
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#73185e] flex items-center gap-2">
                              <Palette className="w-3.5 h-3.5 text-[#BFA054]" /> Cor: <span className="text-[#BFA054]">{selectedColor || "Selecione"}</span>
                           </label>
                        </div>
                        <div className="flex flex-wrap gap-4">
                           {product.colors.map((color, idx) => {
                             const isAvailable = color.isAvailable !== false;
                             return (
                              <button
                                key={idx}
                                disabled={!isAvailable}
                                onClick={() => {
                                   setSelectedColor(color.label);
                                   if (color.imageUrl) setSelectedImage(color.imageUrl);
                                }}
                                className={cn(
                                   "w-10 h-10 rounded-full border-2 transition-all p-0.5 relative",
                                   selectedColor === color.label ? "border-[#73185e]" : "border-transparent",
                                   !isAvailable && "opacity-20 cursor-not-allowed"
                                )}
                              >
                                 <div className="w-full h-full rounded-full border border-black/5" style={{ backgroundColor: color.hex }} />
                                 {selectedColor === color.label && (
                                    <div className="absolute -top-1 -right-1 bg-[#73185e] text-white w-4 h-4 rounded-full flex items-center justify-center scale-75">
                                       <Check className="w-2.5 h-2.5" />
                                    </div>
                                 )}
                              </button>
                             );
                           })}
                        </div>
                     </div>
                  )}

                  {/* Sizes */}
                  {product.sizes && product.sizes.length > 0 && (
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#73185e] flex items-center gap-2">
                              <Ruler className="w-3.5 h-3.5 text-[#BFA054]" /> Tamanho: <span className="text-[#BFA054]">{selectedSize || "Selecione"}</span>
                           </label>
                           <button className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/40 hover:text-[#73185e] transition-colors">Guia de Medidas</button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                           {product.sizes.map((size, idx) => {
                             const isAvailable = size.isAvailable !== false;
                             return (
                              <button
                                key={idx}
                                disabled={!isAvailable}
                                onClick={() => setSelectedSize(size.label)}
                                className={cn(
                                   "min-w-[60px] h-12 border text-[11px] font-bold tracking-widest transition-all",
                                   selectedSize === size.label 
                                    ? "bg-[#73185e] text-white border-[#73185e] shadow-lg shadow-[#73185e]/20" 
                                    : "bg-white text-[#73185e] border-[#73185e]/10 hover:border-[#73185e]/30",
                                   !isAvailable && "opacity-20 cursor-not-allowed line-through border-zinc-100"
                                )}
                              >
                                 {size.label}
                              </button>
                             );
                           })}
                        </div>
                     </div>
                  )}
               </div>

               {/* Actions */}
               <div className="space-y-4 pt-4">
                   <button 
                    onClick={handleAddToCart}
                    disabled={adding || product.stock_status === 'sold_out'}
                    className={cn(
                       "w-full h-16 md:h-20 flex items-center justify-center gap-4 text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold transition-all shadow-2xl relative overflow-hidden",
                       product.stock_status === 'sold_out' 
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                        : "bg-[#73185e] text-white hover:bg-[#5D134B] shadow-[#73185e]/10"
                    )}
                  >
                     {adding ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                     ) : (
                        <>
                           <ShoppingBag className="w-5 h-5" />
                           {product.stock_status === 'sold_out' ? "Esgotado" : "Adicionar à Sacola"}
                        </>
                     )}
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
