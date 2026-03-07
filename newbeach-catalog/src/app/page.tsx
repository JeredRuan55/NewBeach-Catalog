"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/client/Navbar";
import { ShoppingBag, ChevronRight, Megaphone } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  banner_url: string;
  discount_percentage: number;
}

export default function Home() {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        setActiveCampaign(data[0]);
      }
    };

    fetchCampaign();
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image/Gradient */}
        <div className="absolute inset-0 z-0 bg-[#FCF8F9]">
          {activeCampaign?.banner_url ? (
            <motion.div 
               initial={{ scale: 1.1, opacity: 0 }}
               animate={{ scale: 1, opacity: 0.4 }}
               transition={{ duration: 1.5 }}
               className="w-full h-full"
            >
              <img src={activeCampaign.banner_url} className="w-full h-full object-cover grayscale brightness-110" />
            </motion.div>
          ) : (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#73185e]/10 via-transparent to-[#BFA054]/10 opacity-40 blur-3xl rounded-full" />
          )}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#BFA054] font-bold flex items-center justify-center gap-2">
              {activeCampaign ? <><Megaphone className="w-3 h-3" /> Campanha Ativa</> : "Curadoria Exclusiva"}
            </span>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-[#73185e] leading-tight">
              {activeCampaign ? (
                <>
                   {activeCampaign.title.split(' ')[0]} <br />
                   <span className="font-playfair italic font-normal">{activeCampaign.title.split(' ').slice(1).join(' ')}</span>
                </>
              ) : (
                <>
                  A Essência do <br />
                  <span className="font-playfair italic font-normal">Linho & Estilo</span>
                </>
              )}
            </h1>
            <p className="max-w-xl mx-auto text-[#73185e]/70 text-lg leading-relaxed font-outfit">
              {activeCampaign?.subtitle || "Descubra o minimalismo sofisticado da NewBeach. Peças atemporais em tecidos nobres para mulheres que valorizam a versatilidade."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              href="/colecoes" 
              className="group relative px-10 py-4 bg-[#73185e] text-white text-sm uppercase tracking-widest font-bold overflow-hidden transition-all duration-500 hover:pr-14 hover:shadow-xl hover:shadow-[#73185e]/20"
            >
              <span className="relative z-10">Explorar Coleções</span>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>
            
            {activeCampaign?.discount_percentage && (
               <div className="text-xs uppercase tracking-widest font-bold text-[#BFA054] animate-pulse">
                  Economize até {activeCampaign.discount_percentage}% OFF
               </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Categories Spotlight */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: "Marant", img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800", slug: "marant" },
            { name: "Linho", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800", slug: "linho" },
            { name: "Alfaiataria", img: "https://images.unsplash.com/photo-1542060717-d7ca14529ed7?auto=format&fit=crop&q=80&w=800", slug: "alfaiataria" },
          ].map((cat, i) => (
            <Link
              key={cat.name}
              href={`/colecao/${cat.slug}`}
              className="group cursor-pointer block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] mb-4 border border-transparent group-hover:border-[#BFA054]/30 transition-all">
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-[#73185e]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex justify-between items-end">
                  <h3 className="text-xl font-bold tracking-tight uppercase text-[#73185e]">{cat.name}</h3>
                  <span className="text-[10px] text-[#BFA054] uppercase tracking-widest font-bold">Ver Coleção</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
