"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, MapPin, Truck, ChevronRight, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export default function CartDrawer() {
  const { 
    cart, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems,
    shippingFee, shippingAddress, setShipping, clearShipping 
  } = useCart();

  const [cep, setCep] = React.useState("");
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleCalculateShipping = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setError("Digite um CEP válido");
      return;
    }

    setIsCalculating(true);
    setError("");
    
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      
      if (data.erro) {
        setError("CEP não encontrado");
      } else {
        // Simulated premium logic
        let fee = 25;
        if (data.uf === 'SC') fee = 15;
        if (!['SC', 'PR', 'RS', 'SP', 'RJ', 'MG', 'ES'].includes(data.uf)) fee = 40;
        
        // Free shipping for orders over 500
        if (totalPrice >= 500) fee = 0;
        
        setShipping({
          cep: data.cep,
          logradouro: data.logradouro,
          bairro: data.bairro,
          localidade: data.localidade,
          uf: data.uf
        }, fee);
      }
    } catch (e) {
      setError("Erro ao conectar com o serviço de frete");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCheckoutWhatsApp = () => {
    const message = `Olá NewBeach! Gostaria de fazer um pedido:\n\n` +
      cart.map(item => `- ${item.name}${item.color ? ` (Cor: ${item.color})` : ''}${item.size ? ` (Tam: ${item.size})` : ''} - Qtd: ${item.quantity}`).join('\n') +
      `\n\nSubtotal: ${formatCurrency(totalPrice)}` +
      (shippingAddress ? `\nFrete para ${shippingAddress.localidade}/${shippingAddress.uf}: ${shippingFee > 0 ? formatCurrency(shippingFee) : 'GRÁTIS'}\nTotal: ${formatCurrency(totalPrice + shippingFee)}` : '') +
      (shippingAddress ? `\n\nEndereço: ${shippingAddress.logradouro}, ${shippingAddress.bairro}, ${shippingAddress.localidade}-${shippingAddress.uf}` : '') +
      `\n\nAguardo confirmação! ✨`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/5548999999999?text=${encoded}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#D1C0DB] shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#73185e]/10 flex items-center justify-between bg-white/20">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#73185e]" />
                <div>
                  <h2 className="text-lg font-bold text-[#73185e] tracking-tight">Meu Pedido</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[#73185e]/60 font-bold">
                    {totalItems} {totalItems === 1 ? 'item' : 'itens'} selecionados
                  </p>
                </div>
              </div>
              <button 
                onClick={closeCart}
                className="p-2 hover:bg-white/40 rounded-full transition-colors text-[#73185e]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <ShoppingBag className="w-12 h-12 text-[#73185e]" />
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#73185e]">
                    Sua sacola está vazia
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="w-20 h-24 bg-white rounded-sm overflow-hidden flex-shrink-0 shadow-sm border border-[#73185e]/5">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#73185e] line-clamp-1">{item.name}</h3>
                              <button 
                                onClick={() => removeItem(item.id)}
                                className="text-[#73185e]/30 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex gap-2 mt-1">
                               {item.color && (
                                 <span className="text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 bg-white/40 text-[#73185e]/60 rounded-full border border-[#73185e]/5">
                                    Cor: {item.color}
                                 </span>
                               )}
                               {item.size && (
                                 <span className="text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 bg-white/40 text-[#73185e]/60 rounded-full border border-[#73185e]/5">
                                    Tam: {item.size}
                                 </span>
                               )}
                            </div>
                            <p className="text-xs font-bold text-[#BFA054] mt-2">{formatCurrency(item.price)}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-[#73185e]/10 bg-white/40 rounded-sm">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:text-[#73185e] text-[#73185e]/40 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-[10px] font-bold text-[#73185e]">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:text-[#73185e] text-[#73185e]/40 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-[10px] font-bold text-[#73185e]">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Calculator */}
                  <div className="bg-white/40 backdrop-blur-md p-6 rounded-sm border border-[#73185e]/10 space-y-4">
                    <div className="flex items-center gap-2 text-[#73185e]">
                      <Truck className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Cálculo de Frete</span>
                    </div>

                    {!shippingAddress ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={cep}
                            onChange={(e) => setCep(e.target.value)}
                            placeholder="Seu CEP (00000-000)"
                            className="flex-1 bg-white/60 border border-[#73185e]/10 px-4 py-3 text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-[#73185e] placeholder:text-[#73185e]/20"
                            maxLength={9}
                          />
                          <button 
                            onClick={handleCalculateShipping}
                            disabled={isCalculating}
                            className="bg-[#73185e] text-white px-6 py-3 text-[10px] uppercase font-bold hover:bg-[#5D134B] transition-all disabled:opacity-50"
                          >
                            {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Calcular"}
                          </button>
                        </div>
                        {error && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest">{error}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between group">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-[#BFA054] mt-0.5" />
                          <div>
                            <p className="text-[11px] font-bold text-[#73185e] uppercase tracking-tight">
                              {shippingAddress.localidade}, {shippingAddress.uf}
                            </p>
                            <p className="text-[9px] text-[#73185e]/60 font-medium line-clamp-1">
                              {shippingAddress.logradouro}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={clearShipping}
                          className="text-[9px] uppercase tracking-widest font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Alterar
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-8 bg-white/40 backdrop-blur-md border-t border-[#73185e]/10 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center opacity-60">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#73185e]">Produtos</p>
                    <p className="text-sm font-bold text-[#73185e]">{formatCurrency(totalPrice)}</p>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#73185e]/5 pb-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#73185e]/60">Frete</p>
                    <p className="text-sm font-bold text-[#BFA054]">
                      {shippingAddress ? (shippingFee > 0 ? formatCurrency(shippingFee) : 'GRÁTIS') : '--'}
                    </p>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#73185e]">Total</p>
                    <p className="text-2xl font-bold text-[#73185e] tracking-tighter">{formatCurrency(totalPrice + shippingFee)}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleCheckoutWhatsApp}
                    className="w-full py-5 bg-[#73185e] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#5D134B] transition-all shadow-xl shadow-[#73185e]/20 rounded-sm flex items-center justify-center gap-3"
                  >
                    Finalizar via WhatsApp
                  </button>
                  
                  <div className="flex items-center gap-4 py-2 opacity-30">
                     <div className="h-[1px] bg-[#73185e] flex-1" />
                     <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-[#73185e]">ou</span>
                     <div className="h-[1px] bg-[#73185e] flex-1" />
                  </div>

                  <button 
                    onClick={() => {
                      closeCart();
                      window.location.href = '/checkout';
                    }}
                    className="w-full py-4 border border-[#73185e]/10 text-[#73185e] text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white transition-all rounded-sm"
                  >
                    Finalizar no Site (PIX)
                  </button>
                </div>
                
                <p className="text-[9px] text-center text-[#73185e]/40 font-bold uppercase tracking-widest leading-relaxed">
                  Ao finalizar, você será redirecionada para o WhatsApp<br/>para confirmar cores e tamanhos.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
