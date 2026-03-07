"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/client/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CollectionsListing() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (data) setCategories(data);
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return (
    <main className="min-h-screen pt-32 px-6 md:px-12 bg-[#FCFBF7]">
      <Navbar />

      <header className="max-w-7xl mx-auto mb-16 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase text-[#73185e]">
          Nossas <span className="font-playfair italic font-normal">Coleções</span>
        </h1>
        <p className="text-[#73185e]/60 text-sm uppercase tracking-widest border-b border-[#F0E6E9] pb-6">
          Curadoria NewBeach por Estilo e Tecido
        </p>
      </header>

      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-24">
        {loading ? (
             <div className="col-span-full py-24 text-center font-playfair italic text-[#BFA054]">Explorando tecidos...</div>
        ) : categories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/colecao/${cat.slug}`}
            className="group cursor-pointer block"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="space-y-6"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F5F0] border border-transparent group-hover:border-[#BFA054]/20 transition-all">
                 {/* Decorative background or placeholder for category cover image if added later */}
                 <div className="absolute inset-0 bg-gradient-to-br from-[#F7E7EB] to-transparent flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-[#BFA054] mb-2 font-bold">Coleção</span>
                    <h3 className="text-3xl font-serif italic text-[#73185e]">{cat.name}</h3>
                 </div>
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-[#73185e]/5 transition-colors duration-500" />
              </div>
              <div className="flex justify-between items-center border-b border-[#F0E6E9] pb-2 group-hover:border-[#BFA054] transition-colors duration-500">
                <span className="text-xs uppercase tracking-widest font-bold text-[#73185e]">Explorar</span>
                <span className="w-8 h-[1px] bg-[#BFA054] group-hover:w-12 transition-all" />
              </div>
            </motion.div>
          </Link>
        ))}

        {!loading && categories.length === 0 && (
           <div className="col-span-full py-24 text-center opacity-30">
              <p className="text-sm uppercase tracking-widest font-bold">Nenhuma coleção disponível no momento.</p>
           </div>
        )}
      </section>
    </main>
  );
}
