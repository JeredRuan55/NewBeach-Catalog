"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";

interface Color {
  label: string;
  hex: string;
  imageUrl?: string;
  isAvailable?: boolean;
}

interface Size {
  label: string;
  isAvailable?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  colors?: Color[];
  sizes?: Size[];
}

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart?: () => void;
  stockStatus?: 'available' | 'sold_out';
}

export function ProductCard({ product, index, onAddToCart, stockStatus = 'available' }: ProductCardProps) {
  const [hoveredImageUrl, setHoveredImageUrl] = useState<string | null>(null);

  const displayImage = hoveredImageUrl || product.images[0];
  const hasMultipleImages = product.images.length > 1;
  const secondImage = product.images[1];
  
  // A piece is sold out if the global status is sold_out OR all variations are sold_out
  const isGlobalSoldOut = stockStatus === 'sold_out';
  const hasAvailableColors = product.colors ? product.colors.some(c => c.isAvailable !== false) : true;
  const hasAvailableSizes = product.sizes ? product.sizes.some(s => s.isAvailable !== false) : true;
  const isSoldOut = isGlobalSoldOut || (!hasAvailableColors && product.colors && product.colors.length > 0) || (!hasAvailableSizes && product.sizes && product.sizes.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[3/4] overflow-hidden mb-8 bg-white shadow-2xl shadow-black/5 border border-[#F0E6E9] group-hover:border-[#BFA054]/20 transition-all">
        {/* Main Image */}
        <AnimatePresence mode="wait">
          <motion.img 
            key={displayImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            src={displayImage || 'https://via.placeholder.com/300x400?text=NEWBEACH'} 
            alt={product.name} 
            className={cn(
               "w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 grayscale",
               (hasMultipleImages && !hoveredImageUrl) ? "group-hover:opacity-0" : "group-hover:grayscale-0",
               isSoldOut && "opacity-60"
            )}
          />
        </AnimatePresence>

        {/* Second Image on Hover (Default logic if no color is hovered) */}
        {hasMultipleImages && !hoveredImageUrl && (
          <img 
            src={secondImage} 
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover grayscale-0 opacity-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100"
          />
        )}

        {/* Sold Out Badge */}
        {isSoldOut && (
          <div className="absolute top-4 left-4 bg-[#73185e] text-white text-[8px] uppercase tracking-[0.2em] font-bold px-3 py-1.5 shadow-xl z-20">
            Esgotado
          </div>
        )}

        {/* Quick Action */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-all duration-500 bg-white/90 backdrop-blur-md z-30">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onAddToCart?.();
             }}
             disabled={isSoldOut}
             className={cn(
               "w-full py-4 text-[9px] uppercase tracking-[0.3em] font-bold transition-all",
               isSoldOut 
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
                : "bg-[#73185e] text-white hover:bg-[#5D134B] shadow-xl"
             )}
           >
              {isSoldOut ? "Indisponível" : "Comprar Agora"}
           </button>
        </div>
      </div>

      <div className="space-y-4 text-center">
        {/* Colors selector */}
        <div className="flex justify-center gap-2 h-4 items-center">
           {product.colors && product.colors.length > 0 && product.colors.map((color, idx) => (
             <motion.div 
               key={idx} 
               whileHover={color.isAvailable !== false ? { scale: 1.4 } : {}}
               onMouseEnter={() => color.isAvailable !== false && color.imageUrl && setHoveredImageUrl(color.imageUrl)}
               onMouseLeave={() => setHoveredImageUrl(null)}
               className={cn(
                 "w-2.5 h-2.5 rounded-full border border-[#73185e]/10 shadow-sm cursor-pointer transition-all relative overflow-hidden",
                 color.isAvailable === false && "opacity-30 cursor-not-allowed"
               )} 
               style={{ backgroundColor: color.hex }}
               title={color.label + (color.isAvailable === false ? " (Esgotado)" : "")}
             >
                {color.isAvailable === false && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-zinc-400 rotate-45" />
                  </div>
                )}
             </motion.div>
           ))}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#73185e]">{product.name}</h3>
          
          {/* Sizes Display */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex justify-center gap-2 pt-1 pb-1">
              {product.sizes.map((size, idx) => (
                <span 
                  key={idx} 
                  className={cn(
                    "text-[8px] font-bold tracking-widest",
                    size.isAvailable !== false ? "text-[#73185e]/60" : "text-zinc-300 line-through"
                  )}
                >
                  {size.label}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm font-bold text-[#BFA054] font-playfair italic">{formatCurrency(product.price)}</p>
        </div>
      </div>
    </motion.div>
  );
}
