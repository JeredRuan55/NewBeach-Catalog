"use client";

import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/client/Navbar";
import { ChevronRight, Heart, Sparkles, Wind } from "lucide-react";

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-[#D1C0DB]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
        <header className="space-y-6 max-w-3xl">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] text-[#BFA054] font-bold"
          >
            A Nossa História
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-bold tracking-tighter text-[#73185e] leading-tight"
          >
            Redefinindo o <br />
            <span className="font-playfair italic font-normal text-[#BFA054]">Minimalismo Sofisticado</span>
          </motion.h1>
        </header>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="aspect-[21/9] overflow-hidden bg-white/40 relative rounded-[4px] shadow-2xl shadow-[#73185e]/10 border border-white/20"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#73185e]/20 via-transparent to-[#BFA054]/10 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover grayscale brightness-110 group-hover:scale-110 transition-transform duration-[3s]" 
            alt="NewBeach Lifestyle"
          />
          <div className="absolute bottom-8 left-8 z-20">
             <div className="text-[10px] font-bold tracking-[0.6em] text-white uppercase bg-[#73185e] px-4 py-2">
                Est. 2026
             </div>
          </div>
        </motion.div>
      </section>

      {/* Essence Section */}
      <section className="py-32 px-6 md:px-12 bg-white/20 backdrop-blur-xl border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
          {[
            { 
              icon: Wind, 
              title: "Leveza do Linho", 
              desc: "Nossas peças são selecionadas pela qualidade superior das fibras naturais, priorizando o linho puro por sua respirabilidade e toque nobre." 
            },
            { 
              icon: Sparkles, 
              title: "Alfaiataria Moderna", 
              desc: "Acreditamos na versatilidade. Nossas peças transitam do office ao dinner com cortes precisos que valorizam a silhueta feminina." 
            },
            { 
              icon: Heart, 
              title: "Consumo Consciente", 
              desc: "Focamos em peças atemporais que fogem das tendências passageiras, construindo um guarda-roupa duradouro e sofisticado." 
            }
          ].map((item, i) => (
            <motion.div 
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-6 group"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg shadow-[#73185e]/10 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 text-[#73185e]" />
              </div>
              <h3 className="text-xl font-bold tracking-tight uppercase text-[#73185e]">{item.title}</h3>
              <p className="text-sm text-[#73185e]/70 leading-relaxed font-bold uppercase tracking-widest text-[11px]">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-40 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-8 order-2 lg:order-1">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#BFA054] font-bold">Nossa Filosofia</span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight text-[#73185e]">
              Para a mulher que entende que <br />
              <span className="font-playfair italic font-normal text-[#BFA054] underline underline-offset-8 decoration-1 decoration-[#BFA054]">menos é sempre mais</span>.
            </h2>
            <p className="text-[#73185e]/70 leading-relaxed font-bold uppercase tracking-[0.2em] text-[12px]">
              A NewBeach nasceu do desejo de simplificar o luxo. Não no sentido de torná-lo pretensioso, mas sim de torná-lo funcional. Nossa curadoria foca em tecidos de alta qualidade — linho puro, algodão egípcio e viscose nobre — que proporcionam bem-estar ao vestir e elegância sem esforço ao caminhar.
            </p>
          </div>
          <div className="aspect-square bg-white/40 order-1 lg:order-2 overflow-hidden relative rounded-[4px] shadow-2xl border border-white/20">
              <div className="absolute inset-0 bg-[#73185e]/10 z-10" />
              <img 
                src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover grayscale brightness-110" 
                alt="NewBeach Essence"
              />
          </div>
        </div>
      </section>

      <footer className="py-32 px-6 md:px-12 border-t border-white/10 text-center space-y-12">
         <h3 className="text-2xl font-bold uppercase tracking-[0.3em] text-[#73185e]">Siga a nossa jornada</h3>
         <div className="flex justify-center gap-12 text-[11px] uppercase tracking-[0.5em] font-bold text-[#BFA054]">
            <a href="#" className="hover:text-[#73185e] transition-colors">Instagram</a>
            <a href="#" className="hover:text-[#73185e] transition-colors">Pinterest</a>
            <a href="#" className="hover:text-[#73185e] transition-colors">TikTok</a>
         </div>
         <div className="pt-12">
            <div className="text-3xl font-bold tracking-tighter text-[#73185e] opacity-20">NEWBEACH</div>
            <p className="text-[9px] text-[#73185e]/40 uppercase tracking-[0.4em] font-bold mt-4">© 2026 Curadoria Especializada. Todos os direitos reservados.</p>
         </div>
      </footer>
    </main>
  );
}
