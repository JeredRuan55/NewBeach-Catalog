"use client";

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/client/Navbar';
import { CheckCircle2, QrCode, Copy, Share2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || '0000';
  const total = searchParams.get('total') || '0.00';
  
  const pixKey = "6d7f4ff2-2806-487e-84dd-1f7d73ab7e76"; // Chave Aleatória

  // Função para calcular o CRC16 (requerido para o PIX ser válido)
  const calcCRC16 = (payload: string) => {
    let result = 0xFFFF;
    const len = payload.length;

    for (let i = 0; i < len; i++) {
        result ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if (result & 0x8000) result = (result << 1) ^ 0x1021;
            else result <<= 1;
            result &= 0xFFFF;
        }
    }
    return result.toString(16).toUpperCase().padStart(4, '0');
  };

  // Função para gerar o payload do PIX (Padrão BRCode completo)
  const generatePixPayload = (key: string, amount: string) => {
    const formattedAmount = parseFloat(amount).toFixed(2);
    const merchantName = "NEWBEACH";
    const merchantCity = "SAO PAULO";

    // Subcampos do Merchant Account Information (ID 26)
    const gui = "0014BR.GOV.BCB.PIX";
    const keySubfield = `01${key.length.toString().padStart(2, '0')}${key}`;
    const merchantAccountInfo = `${gui}${keySubfield}`;

    const blocks = [
      { id: '00', val: '01' }, // Payload Format Indicator
      { id: '26', val: merchantAccountInfo }, // Merchant Account Information
      { id: '52', val: '0000' }, // Merchant Category Code
      { id: '53', val: '986' }, // Transaction Currency (BRL)
      { id: '54', val: formattedAmount }, // Transaction Amount
      { id: '58', val: 'BR' }, // Country Code
      { id: '59', val: merchantName }, // Merchant Name
      { id: '60', val: merchantCity }, // Merchant City
      { id: '62', val: '0503***' }, // Additional Data Field (ID 05: Transaction ID)
    ];

    let payload = blocks.map(b => `${b.id}${b.val.length.toString().padStart(2, '0')}${b.val}`).join('');
    payload += "6304"; // ID 63 (CRC16) e tamanho 04
    payload += calcCRC16(payload);

    return payload;
  };

  const pixPayload = generatePixPayload(pixKey, total);

  const copyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    alert("Código PIX Copia e Cola copiado!");
  };

  return (
    <div className="max-w-xl w-full text-center space-y-12">
      <motion.div
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="space-y-6"
      >
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-8 border border-emerald-100 italic">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-[#73185e] uppercase">
          Pedido <span className="font-playfair italic font-normal text-[#BFA054]">#{(orderId.slice(-4)).toUpperCase()}</span>
        </h1>
        <p className="text-[#73185e]/60 text-[11px] uppercase tracking-widest font-bold leading-relaxed">
          Sua reserva NewBeach foi iniciada com sucesso. <br/> 
          Aguardamos seu pagamento para liberar o envio.
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
           <span className="text-[10px] uppercase tracking-widest font-bold">Pagamento Instantâneo</span>
        </div>

        <div className="mx-auto bg-white p-4 border border-[#73185e]/10 w-fit">
           <QRCodeSVG 
            value={pixPayload}
            size={200}
            level="H"
            includeMargin={true}
            fgColor="#73185e"
           />
        </div>

        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]/60">PIX Copia e Cola</p>
          <div className="flex items-center gap-2 bg-[#D1C0DB]/20 p-4 border border-[#73185e]/5 rounded-sm">
             <span className="flex-1 text-[10px] font-bold text-[#73185e] tracking-wider truncate text-left">{pixPayload}</span>
             <button onClick={copyPix} className="p-2 hover:bg-white rounded-full transition-colors text-[#BFA054]">
                <Copy className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#73185e]/5">
           <p className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]/60 mb-2">Total a Pagar</p>
           <p className="text-3xl font-bold text-[#73185e] tracking-tighter">R$ {parseFloat(total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-[#FCFBF7] flex flex-col items-center">
      <Navbar />
      <Suspense fallback={<div>Carregando Pedido...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
