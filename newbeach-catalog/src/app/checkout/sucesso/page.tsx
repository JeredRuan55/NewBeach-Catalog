"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/client/Navbar';
import { CheckCircle2, QrCode, Copy, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const pixKey = "000.000.000-00"; // Exemplo

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    alert("Código PIX copiado!");
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-[#FCFBF7] flex flex-col items-center">
      <Navbar />
      
      <div className="max-w-xl w-full text-center space-y-12">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-8 border border-emerald-100 italic">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-[#73185e] uppercase">Pedido <span className="font-playfair italic font-normal text-[#BFA054]">Recebido!</span></h1>
          <p className="text-[#73185e]/60 text-[11px] uppercase tracking-widest font-bold leading-relaxed">
            Sua reserva NewBeach foi iniciada com sucesso. <br/> 
            Agora você faz parte da nossa curadoria exclusiva.
          </p>
        </motion.div>

        {/* PIX Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-10 border border-[#73185e]/10 space-y-8 shadow-sm"
        >
          <div className="flex items-center justify-center gap-2 text-[#73185e] mb-4">
             <QrCode className="w-4 h-4" />
             <span className="text-[10px] uppercase tracking-widest font-bold">Pagamento via PIX</span>
          </div>

          <div className="aspect-square w-48 mx-auto bg-zinc-50 border border-dashed border-[#73185e]/20 flex items-center justify-center p-4">
             {/* Placeholder para QR Code */}
             <div className="w-full h-full bg-[#73185e]/5 flex items-center justify-center opacity-40">
                <QrCode className="w-24 h-24 text-[#73185e]" />
             </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]/60">Chave PIX (E-mail ou CPF)</p>
            <div className="flex items-center gap-2 bg-[#D1C0DB]/20 p-4 border border-[#73185e]/5 rounded-sm">
               <span className="flex-1 text-xs font-bold text-[#73185e] tracking-wider">{pixKey}</span>
               <button onClick={copyPix} className="p-2 hover:bg-white rounded-full transition-colors text-[#BFA054]">
                  <Copy className="w-4 h-4" />
               </button>
            </div>
          </div>

          <p className="text-[9px] uppercase tracking-widest text-[#73185e]/40 font-bold max-w-[300px] mx-auto leading-relaxed">
            Após o pagamento, envie o comprovante via <span className="text-[#BFA054] underline">WhatsApp</span> para acelerar o envio da sua caixa premium.
          </p>
        </motion.div>

        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
           className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
           <Link href="/colecoes" className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]/60 hover:text-[#73185e] flex items-center gap-2 transition-all">
              Continuar Comprando <ArrowRight className="w-3 h-3" />
           </Link>
           <button className="flex items-center gap-2 px-8 py-4 bg-[#73185e] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#5D134B] transition-all shadow-xl shadow-[#73185e]/20">
              <Share2 className="w-4 h-4" /> Compartilhar Compra
           </button>
        </motion.div>
      </div>
    </main>
  );
}
