"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/client/Navbar";
import { 
  ShoppingBag, 
  ChevronRight, 
  Megaphone, 
  Truck, 
  ShieldCheck, 
  Heart, 
  ArrowRight, 
  Mail, 
  Instagram,
  Quote
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatCurrency, cn } from "@/lib/utils";
import { ProductCard } from "@/components/client/ProductCard";

interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  banner_url: string;
  discount_percentage: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug?: string;
  is_featured: boolean;
  colors?: { label: string; hex: string; imageUrl?: string; isAvailable?: boolean }[];
  sizes?: { label: string; isAvailable?: boolean }[];
}

export default function Home() {
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch Active Campaign
        const { data: campaignData } = await supabase
          .from('campaigns')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (campaignData && campaignData.length > 0) {
          setActiveCampaign(campaignData[0]);
        }

        // Fetch Featured Products
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .limit(4);
        
        if (productsData) {
          setFeaturedProducts(productsData);
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Bem-vinda ao Club Privé NewBeach! Você receberá nossas novidades em breve.");
    setEmail("");
  };

  return (
    <main className="min-h-screen bg-[#FCFBF7]">

      <Navbar />

      {/* Hero Section with Cinematic Video Background */}
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
           {/* Storefront Hero Background */}
           <img 
             src="/hero-store.jpg?v=10" 
             alt="NewBeach storefront"
             className="w-full h-full object-cover" 
           />
           <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FCFBF7]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-6">
            <motion.span 
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.5em" }}
              transition={{ duration: 1 }}
              className="text-[10px] uppercase font-bold text-[#BFA054] block"
            >
              {activeCampaign ? "Coleção Ativa" : "Sua Próxima Escolha"}
            </motion.span>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="max-w-md mx-auto text-white text-sm leading-relaxed uppercase tracking-[0.3em] font-bold drop-shadow-lg"
            >
              {activeCampaign?.subtitle || "O encontro entre a sofisticação atemporal e o design contemporâneo."}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Link 
              href="/colecoes" 
              className="group relative inline-flex items-center gap-6 md:gap-10 px-8 md:px-12 py-4 md:py-6 bg-white text-[#73185e] text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-bold shadow-2xl hover:bg-[#73185e] hover:text-white transition-all duration-500"
            >
              <span className="relative z-10">Explorar Coleção</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden md:flex"
        >
          <span className="text-[8px] uppercase tracking-[0.5em] text-white/40 font-bold rotate-90 origin-left ml-2">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </section>

      {/* Manifesto Section (Luxo) */}
      <section className="py-40 px-6 text-center bg-white">
        <div className="max-w-3xl mx-auto space-y-12">
           <motion.div
             initial={{ scaleY: 0 }}
             whileInView={{ scaleY: 1 }}
             viewport={{ once: true }}
             className="w-px h-24 bg-[#BFA054] mx-auto origin-top"
           />
           <h2 className="text-3xl md:text-5xl font-playfair italic text-[#73185e] leading-snug">
             "Criamos para a mulher que encontra liberdade na elegância e conforto na nobreza dos materiais."
           </h2>
           <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#BFA054]">São Paulo — Brasil</p>
              <p className="text-[11px] text-[#73185e]/40 uppercase tracking-widest font-bold max-w-lg mx-auto leading-relaxed">
                Cada detalhe, cada corte impecável é pensado para ser uma extensão da sua personalidade.
              </p>
           </div>
        </div>
      </section>




      {/* Instagram Placeholder Feed */}
      <section className="py-24 bg-[#FCFBF7] border-t border-[#73185e]/5">
         <div className="max-w-7xl mx-auto px-6 space-y-16">
            <header className="flex items-center justify-between">
               <a 
                 href="https://www.instagram.com/newbeach2/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-4 hover:opacity-70 transition-opacity"
               >
                  <Instagram className="w-6 h-6 text-[#73185e]" />
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#73185e]">@newbeach2</span>
               </a>
               <span className="text-[9px] uppercase tracking-widest font-bold text-[#BFA054]">Explore a Comunidade</span>
            </header>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
               {[1,2,3,4,5,6].map((n) => (
                 <div key={n} className="aspect-square bg-zinc-200 overflow-hidden relative group">
                    <img 
                      src={`https://images.unsplash.com/photo-${1515886657613 + n}-9160e14e273c?auto=format&fit=crop&q=60&w=400`} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-[#73185e]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Instagram className="w-6 h-6 text-white" />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>


      {/* Trust Badges */}
      <section className="py-24 border-t border-[#73185e]/5 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">
           <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#FCFBF7] flex items-center justify-center border border-[#73185e]/5 shadow-sm">
                 <Truck className="w-6 h-6 text-[#BFA054]" />
              </div>
              <div className="space-y-2">
                <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#73185e]">Envio Premium</h4>
                <p className="text-[9px] uppercase tracking-widest text-[#73185e]/40 font-bold leading-relaxed">Embalagens sustentáveis e entrega nacional garantida.</p>
              </div>
           </div>
           <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#FCFBF7] flex items-center justify-center border border-[#73185e]/5 shadow-sm">
                 <ShieldCheck className="w-6 h-6 text-[#BFA054]" />
              </div>
              <div className="space-y-2">
                <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#73185e]">Ambiente Seguro</h4>
                <p className="text-[9px] uppercase tracking-widest text-[#73185e]/40 font-bold leading-relaxed">Sua privacidade e segurança em cada checkout.</p>
              </div>
           </div>
           <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#FCFBF7] flex items-center justify-center border border-[#73185e]/5 shadow-sm">
                 <Heart className="w-6 h-6 text-[#BFA054]" />
              </div>
              <div className="space-y-2">
                <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#73185e]">Atendimento Humanizado</h4>
                <p className="text-[9px] uppercase tracking-widest text-[#73185e]/40 font-bold leading-relaxed">Fale com nosso time diretamente via WhatsApp.</p>
              </div>
           </div>
        </div>
      </section>

      {/* Simple Footer Placeholder */}
      <footer className="py-20 bg-[#FCFBF7] border-t border-[#73185e]/10 text-center">
         <div className="max-w-7xl mx-auto px-6 space-y-8">
            <h3 className="text-2xl font-bold tracking-tighter text-[#73185e] uppercase">NEW <span className="font-playfair italic font-normal text-[#BFA054]">BEACH</span></h3>
            <div className="flex justify-center gap-12 text-[9px] uppercase tracking-[0.3em] font-bold text-[#73185e]/40">
               <Link href="/colecoes" className="hover:text-[#73185e] transition-colors">Produtos</Link>
               <Link href="/sobre" className="hover:text-[#73185e] transition-colors">A Marca</Link>
               <Link href="/contato" className="hover:text-[#73185e] transition-colors">Suporte</Link>
            </div>
            <p className="text-[8px] text-[#73185e]/30 uppercase tracking-[0.2em] font-bold">© 2026 NEWBEACH. ALL RIGHTS RESERVED.</p>
         </div>
      </footer>
    </main>
  );
}
