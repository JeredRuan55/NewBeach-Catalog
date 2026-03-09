"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/client/Navbar";
import { motion } from "framer-motion";
import { Filter, SlidersHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_status: 'available' | 'sold_out';
  images: string[];
  categories?: { slug: string };
}

export default function CollectionPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*, categories(slug)');
      
      const { data, error } = await query;
      
      if (data) {
        // Filter by slug client-side or use dynamic filtering if we had the category_id
        const filtered = slug ? data.filter(p => p.categories?.slug === slug) : data;
        setProducts(filtered);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [slug]);

  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    if (product.stock_status === 'sold_out') return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || 'https://via.placeholder.com/300x400',
      quantity: 1
    });
  };

  return (
    <main className="min-h-screen pt-32 px-6 md:px-12 bg-[#FCFBF7]">
      <Navbar />

      <header className="max-w-7xl mx-auto mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-[#73185e]">
          Coleção <span className="font-playfair italic capitalize font-normal">{slug}</span>
        </h1>
        <div className="flex items-center justify-between border-b border-[#F0E6E9] pb-6">
          <p className="text-[#73185e]/60 text-sm uppercase tracking-widest font-bold">
            {products.length} Resultados
          </p>
          <div className="flex items-center space-x-6 text-[#73185e]/70 text-xs uppercase tracking-widest font-bold cursor-pointer">
            <span className="flex items-center gap-2 hover:text-[#BFA054] transition-colors">
              <Filter className="w-4 h-4" /> Filtros
            </span>
            <span className="flex items-center gap-2 hover:text-[#BFA054] transition-colors">
              <SlidersHorizontal className="w-4 h-4" /> Ordenar
            </span>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 pb-24">
        {loading ? (
          <div className="col-span-full py-24 text-center font-playfair italic text-[#BFA054]">
            Buscando peças da NewBeach...
          </div>
        ) : products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group cursor-pointer relative"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-white border border-[#F0E6E9] mb-4 group-hover:border-[#BFA054]/30 transition-all">
              {product.images?.[0] ? (
                 <img 
                 src={product.images[0]} 
                 alt={product.name}
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
               />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#F7E7EB] opacity-40">
                   <div className="text-[10px] font-bold tracking-[0.3em] text-[#73185e]">NEWBEACH</div>
                   <div className="text-[8px] uppercase text-[#BFA054] font-bold pt-1">Peça Exclusiva</div>
                </div>
              )}
             
              {product.stock_status === 'sold_out' && (
                <div className="absolute top-4 left-4 sold-out-badge !bg-[#73185e] !text-white">
                  Esgotado
                </div>
              )}
              {/* Quick Add */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={product.stock_status === 'sold_out'}
                  className={`w-full py-3 text-[10px] uppercase tracking-widest font-bold transition-all shadow-xl ${
                    product.stock_status === 'sold_out' 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#73185e] text-white hover:bg-[#5D134B]'
                  }`}
                >
                  {product.stock_status === 'sold_out' ? 'Indisponível' : 'Comprar Agora'}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#73185e]">
                {product.name}
              </h3>
              <p className="text-sm font-playfair italic text-[#BFA054]">
                {formatCurrency(product.price)}
              </p>
            </div>
          </motion.div>
        ))}

        {!loading && products.length === 0 && (
           <div className="col-span-full py-24 text-center opacity-30">
              <p className="text-sm uppercase tracking-widest font-bold">Nenhuma peça encontrada nesta categoria</p>
           </div>
        )}
      </section>
    </main>
  );
}
