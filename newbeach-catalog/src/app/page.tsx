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
      {/* Announcement Bar */}
      <div className="bg-[#73185e] py-2 text-center overflow-hidden border-b border-white/10 z-[60] relative">
        <motion.p 
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="text-[9px] uppercase tracking-[0.4em] font-bold text-white whitespace-nowrap"
        >
          ENVIAMOS PARA TODO O BRASIL — 5% OFF NO PIX — CURADORIA EXCLUSIVA NEWBEACH
        </motion.p>
      </div>

      <Navbar />

      {/* Hero Section with Cinematic Video Background */}
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
           {/* Cinematic Video Background - Fallback to image if video fails or is loading */}
           <video 
             autoPlay 
             muted 
             loop 
             playsInline
             className="w-full h-full object-cover scale-105 brightness-[0.8] grayscale-[0.2]"
             poster={activeCampaign?.banner_url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1920"}
           >
             <source src="https://player.vimeo.com/external/494366500.hd.mp4?s=3027b6863d09a0614f85e92751433f481232849e&profile_id=175" type="video/mp4" />
           </video>
           <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FCFBF7]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-6">
            <motion.span 
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.5em" }}
              transition={{ duration: 1 }}
              className="text-[10px] uppercase font-bold text-[#BFA054] block"
            >
              {activeCampaign ? "Coleção Ativa" : "Alta Curadoria de Moda"}
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="text-5xl md:text-[10rem] font-bold tracking-tighter text-white leading-[0.85] mix-blend-overlay"
            >
              NEW <br />
              <span className="font-playfair italic font-normal text-[#BFA054] mix-blend-normal">BEACH</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="max-w-md mx-auto text-white/80 text-sm leading-relaxed uppercase tracking-[0.3em] font-bold"
            >
              {activeCampaign?.subtitle || "A sofisticação do linho encontra o design contemporâneo."}
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
              <span className="relative z-10">Explorar Curadoria</span>
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
              <p className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#BFA054]">Santa Catarina — Brasil</p>
              <p className="text-[11px] text-[#73185e]/40 uppercase tracking-widest font-bold max-w-lg mx-auto leading-relaxed">
                Cada fibra de linho, cada corte de alfaiataria é pensado para ser uma extensão da sua personalidade.
              </p>
           </div>
        </div>
      </section>

      {/* Featured Curadoria */}
      <section className="py-32 px-6 md:px-12 bg-[#FCFBF7]">
        <div className="max-w-7xl mx-auto space-y-24">
          <header className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
             <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#BFA054]">Must-Have</span>
                <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#73185e] uppercase">
                  THE <span className="font-playfair italic font-normal">ESSENTIALS</span>
                </h2>
             </div>
             <Link href="/colecoes" className="group flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-[#73185e] hover:text-[#BFA054] transition-colors border-b border-[#73185e]/10 pb-2">
                Ver Coleção Completa <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
             </Link>
          </header>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-16">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
            ) : (
                [1,2,3,4].map((n) => (
                    <div key={n} className="aspect-[3/4] bg-zinc-100 animate-pulse rounded-[2px]" />
                ))
            )}
          </div>
        </div>
      </section>

      {/* Social Proof Section (Luxury Testimonials) */}
      <section className="py-40 bg-[#73185e] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5">
           <Quote className="w-64 h-64" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-8">
                 <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#BFA054]">Experiência NewBeach</span>
                 <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight uppercase">
                    O que dizem as <br /> 
                    <span className="font-playfair italic font-normal text-[#BFA054]">nossas clientes</span>
                 </h2>
                 <p className="text-[#D1C0DB] text-[11px] uppercase tracking-widest font-bold max-w-sm">
                    Mais que moda, entregamos confiança e sofisticação em cada caixa aberta.
                 </p>
              </div>
              
              <div className="grid grid-cols-1 gap-12">
                 {[
                   { name: "Mariana S.", city: "Balneário Camboriú", text: "O tecido é impecável. O caimento do linho da NewBeach é algo que eu só encontrava em marcas europeias." },
                   { name: "Camila R.", city: "São Paulo", text: "O atendimento via site foi perfeito e o QR Code do PIX facilitou demais. Minha caixa chegou perfumada!" }
                 ].map((t, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: 20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.2 }}
                     className="space-y-4 border-l border-[#BFA054]/30 pl-8"
                   >
                      <p className="text-xl md:text-2xl font-playfair italic leading-relaxed text-zinc-100">"{t.text}"</p>
                      <div>
                         <p className="text-[10px] uppercase tracking-widest font-bold text-[#BFA054]">{t.name}</p>
                         <p className="text-[9px] uppercase tracking-widest font-bold text-[#D1C0DB] opacity-60">{t.city}</p>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* Categories Gallery (Improved Contrast) */}
      <section className="py-40 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
             <h2 className="text-5xl font-bold tracking-tighter text-[#73185e] uppercase">
                CURADORIA POR <span className="font-playfair italic font-normal text-[#BFA054]">LINHA</span>
             </h2>
             <div className="w-20 h-px bg-[#BFA054] mx-auto opacity-30" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: "Marant", img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800", slug: "marant", desc: "Fluidez e sofisticação urbana" },
              { name: "Linho", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800", slug: "linho", desc: "A pureza da fibra natural" },
              { name: "Alfaiataria", img: "https://images.unsplash.com/photo-1542060717-d7ca14529ed7?auto=format&fit=crop&q=80&w=800", slug: "alfaiataria", desc: "Cortes precisos" },
            ].map((cat, i) => (
              <Link
                key={cat.name}
                href={`/colecao/${cat.slug}`}
                className="group block space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden shadow-2xl group-hover:shadow-black/10 transition-all duration-1000">
                    <img 
                      src={cat.img} 
                      alt={cat.name} 
                      className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-1000" />
                  </div>
                  <div className="pt-2 flex justify-between items-center group-hover:px-2 transition-all">
                    <div>
                         <h3 className="text-2xl font-bold tracking-tight uppercase text-[#73185e]">{cat.name}</h3>
                         <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#73185e]/40 mt-1">{cat.desc}</p>
                     </div>
                    <ArrowRight className="w-5 h-5 text-[#BFA054] -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Placeholder Feed */}
      <section className="py-24 bg-[#FCFBF7] border-t border-[#73185e]/5">
         <div className="max-w-7xl mx-auto px-6 space-y-16">
            <header className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <Instagram className="w-6 h-6 text-[#73185e]" />
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#73185e]">@newbeach.oficial</span>
               </div>
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

      {/* Newsletter (Club Privé) */}
      <section className="py-32 bg-white">
         <div className="max-w-2xl mx-auto px-6 text-center space-y-12">
            <div className="inline-flex p-4 rounded-full bg-[#73185e]/5 text-[#73185e] mb-4">
               <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-4">
               <h2 className="text-4xl font-bold tracking-tighter text-[#73185e] uppercase">
                  CLUB <span className="font-playfair italic font-normal text-[#BFA054]">PRIVÉ</span>
               </h2>
               <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#73185e]/40 leading-relaxed max-w-sm mx-auto">
                  Acesso antecipado a novas drops e curadorias limitadas.
               </p>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
               <input 
                 required
                 type="email" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Seu melhor e-mail"
                 className="flex-1 bg-zinc-50 border border-[#73185e]/10 px-6 py-5 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-[#73185e] transition-all" 
               />
               <button className="px-12 py-5 bg-[#73185e] text-white text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#5D134B] transition-all shadow-xl shadow-[#73185e]/10">
                  Participar
               </button>
            </form>
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
                <p className="text-[9px] uppercase tracking-widest text-[#73185e]/40 font-bold leading-relaxed">Fale com nossa curadoria diretamente via WhatsApp.</p>
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
