"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/client/Navbar";
import { motion } from "framer-motion";
import { Filter, SlidersHorizontal } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/client/ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_status: 'available' | 'sold_out';
  images: string[];
  categories?: { slug: string };
  colors?: { label: string; hex: string; imageUrl?: string; isAvailable?: boolean }[];
  sizes?: { label: string; isAvailable?: boolean }[];
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
          <ProductCard 
            key={product.id} 
            product={product} 
            index={i} 
            onAddToCart={() => handleAddToCart(product)}
            stockStatus={product.stock_status}
          />
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
