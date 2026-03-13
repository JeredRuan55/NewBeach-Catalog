"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/client/Navbar';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { ChevronLeft, CreditCard, QrCode, Truck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, totalPrice, shippingFee, shippingAddress, clearCart } = useCart();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: {
      logradouro: shippingAddress?.logradouro || '',
      numero: '',
      complemento: '',
      bairro: shippingAddress?.bairro || '',
      cidade: shippingAddress?.localidade || '',
      uf: shippingAddress?.uf || '',
      cep: shippingAddress?.cep || ''
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...(prev as any)[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    try {
      const finalTotal = (totalPrice * (paymentMethod === 'pix' ? 0.95 : 1)) + (paymentMethod === 'pix' ? 0 : shippingFee);

      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_whatsapp: formData.whatsapp,
        total_amount: finalTotal,
        status: 'pendente',
        items: cart,
        shipping_address: formData.address,
        payment_method: paymentMethod
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) throw error;

      // Logic for success navigation
      const orderId = data[0].id;
      clearCart();
      router.push(`/checkout/sucesso?id=${orderId}&total=${finalTotal}`);
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center space-y-6">
        <Navbar />
        <div className="w-16 h-16 rounded-full bg-[#73185e]/5 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#73185e]/20" />
        </div>
        <h1 className="text-2xl font-bold text-[#73185e] tracking-tighter uppercase">Sua sacola está vazia</h1>
        <Link href="/colecoes" className="px-8 py-4 bg-[#73185e] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#5D134B] transition-all">
          Começar a Comprar
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-[#FCFBF7]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Form Side */}
          <div className="space-y-12">
            <header className="space-y-4">
              <Link href="/" className="flex items-center gap-2 text-[#73185e]/40 hover:text-[#73185e] transition-colors text-[10px] uppercase tracking-widest font-bold">
                <ChevronLeft className="w-4 h-4" /> Voltar ao Início
              </Link>
              <h1 className="text-4xl font-bold tracking-tighter text-[#73185e] uppercase">Finalizar <span className="font-playfair italic font-normal text-[#BFA054]">Pedido</span></h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Personal Info */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#73185e]/10 pb-4">
                  <div className="w-6 h-6 rounded-full bg-[#73185e] text-white text-[10px] flex items-center justify-center font-bold">1</div>
                  <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#73185e]">Informações Pessoais</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">Nome Completo</label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-white border border-[#73185e]/10 px-4 py-4 text-xs font-bold text-[#73185e] outline-none focus:border-[#73185e]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">E-mail</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white border border-[#73185e]/10 px-4 py-4 text-xs font-bold text-[#73185e] outline-none focus:border-[#73185e]" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">WhatsApp</label>
                    <input required name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} className="w-full bg-white border border-[#73185e]/10 px-4 py-4 text-xs font-bold text-[#73185e] outline-none focus:border-[#73185e]" placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </section>

              {/* Delivery Info - Hidden for PIX as requested */}
              {paymentMethod !== 'pix' && (
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-[#73185e]/10 pb-4">
                    <div className="w-6 h-6 rounded-full bg-[#73185e] text-white text-[10px] flex items-center justify-center font-bold">2</div>
                    <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#73185e]">Entrega</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">CEP</label>
                      <input required name="address.cep" value={formData.address.cep} onChange={handleInputChange} className="w-full bg-white border border-[#73185e]/10 px-4 py-4 text-xs font-bold text-[#73185e] outline-none focus:border-[#73185e]" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">Endereço (Rua/Avenida)</label>
                      <input required name="address.logradouro" value={formData.address.logradouro} onChange={handleInputChange} className="w-full bg-white border border-[#73185e]/10 px-4 py-4 text-xs font-bold text-[#73185e] outline-none focus:border-[#73185e]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">Número</label>
                      <input required name="address.numero" value={formData.address.numero} onChange={handleInputChange} className="w-full bg-white border border-[#73185e]/10 px-4 py-4 text-xs font-bold text-[#73185e] outline-none focus:border-[#73185e]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">Complemento</label>
                      <input name="address.complemento" value={formData.address.complemento} onChange={handleInputChange} className="w-full bg-white border border-[#73185e]/10 px-4 py-4 text-xs font-bold text-[#73185e] outline-none focus:border-[#73185e]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">Cidade</label>
                      <input required name="address.cidade" value={formData.address.cidade} onChange={handleInputChange} className="w-full bg-white border border-[#73185e]/10 px-4 py-4 text-xs font-bold text-[#73185e] outline-none focus:border-[#73185e]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#73185e]/60">UF</label>
                      <input required name="address.uf" value={formData.address.uf} onChange={handleInputChange} className="w-full bg-white border border-[#73185e]/10 px-4 py-4 text-xs font-bold text-[#73185e] outline-none focus:border-[#73185e]" />
                    </div>
                  </div>
                </section>
              )}

              {/* Payment Info */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#73185e]/10 pb-4">
                  <div className="w-6 h-6 rounded-full bg-[#73185e] text-white text-[10px] flex items-center justify-center font-bold">3</div>
                  <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#73185e]">Pagamento</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setPaymentMethod('pix')}
                    className={cn(
                      "p-6 border flex items-center gap-4 cursor-pointer transition-all",
                      paymentMethod === 'pix' ? "border-[#73185e] bg-[#73185e]/5" : "border-[#73185e]/10 bg-white hover:border-[#73185e]/40"
                    )}
                  >
                    <QrCode className={cn("w-6 h-6", paymentMethod === 'pix' ? "text-[#73185e]" : "text-[#73185e]/40")} />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">PIX (Imediato)</p>
                      <p className="text-[8px] uppercase tracking-widest text-[#BFA054] font-bold">5% OFF EXTRA</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "p-6 border flex items-center gap-4 cursor-pointer transition-all opacity-50 pointer-events-none",
                      paymentMethod === 'card' ? "border-[#73185e] bg-[#73185e]/5" : "border-[#73185e]/10 bg-white"
                    )}
                  >
                    <CreditCard className="w-6 h-6 text-[#73185e]/40" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]/40">Cartão de Crédito</p>
                      <p className="text-[8px] uppercase tracking-widest text-[#73185e]/40 font-bold">Em breve</p>
                    </div>
                  </div>
                </div>
              </section>

              <button 
                disabled={isSubmitting}
                className="w-full py-6 bg-[#73185e] text-white text-[11px] uppercase tracking-[0.4em] font-bold shadow-2xl shadow-[#73185e]/30 hover:bg-[#5D134B] transition-all flex items-center justify-center gap-4"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finalizar Pedido Premium <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          {/* Cart Side */}
          <div className="lg:sticky lg:top-32 h-fit space-y-8 bg-white/40 backdrop-blur-md p-10 border border-[#73185e]/5">
            <h2 className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#73185e] border-b border-[#73185e]/10 pb-6">Resumo do Pedido</h2>
            
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-white border border-[#73185e]/5 overflow-hidden flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover grayscale" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#73185e]">{item.name}</h3>
                    <p className="text-[9px] text-[#73185e]/40 font-bold uppercase tracking-widest">Qtd: {item.quantity}</p>
                    <p className="text-xs font-bold text-[#BFA054] mt-1">{formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-[#73185e]/10">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-[#73185e]/60">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              {paymentMethod !== 'pix' && (
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-[#73185e]/60">
                  <span className="flex items-center gap-2"><Truck className="w-3 h-3" /> Frete</span>
                  <span>{shippingFee === 0 ? 'GRÁTIS' : formatCurrency(shippingFee)}</span>
                </div>
              )}
              {paymentMethod === 'pix' && (
                <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-emerald-600">
                  <span>Desconto PIX (5%)</span>
                  <span>- {formatCurrency(totalPrice * 0.05)}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-4">
                <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#73185e]">Total Final</span>
                <span className="text-3xl font-bold tracking-tighter text-[#73185e] font-playfair italic">
                  {formatCurrency((totalPrice * (paymentMethod === 'pix' ? 0.95 : 1)) + (paymentMethod === 'pix' ? 0 : shippingFee))}
                </span>
              </div>
            </div>

            <div className="bg-[#73185e]/5 p-6 space-y-3">
              <p className="text-[9px] uppercase tracking-widest font-bold text-[#73185e] flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-[#BFA054]" /> NewBeach Guarantee
              </p>
              <p className="text-[8px] uppercase tracking-widest text-[#73185e]/50 font-medium leading-relaxed">
                Cada peça é revisada por nossa curadoria antes do envio. Entrega garantida e luxuosa.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

import { cn } from '@/lib/utils';
