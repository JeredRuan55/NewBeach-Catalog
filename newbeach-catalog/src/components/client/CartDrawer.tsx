"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

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
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <ShoppingBag className="w-12 h-12 text-[#73185e]" />
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#73185e]">
                    Sua sacola está vazia
                  </p>
                </div>
              ) : (
                cart.map((item) => (
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
                        <p className="text-xs font-bold text-[#BFA054] mt-1">{formatCurrency(item.price)}</p>
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
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-8 bg-white/40 backdrop-blur-md border-t border-[#73185e]/10 space-y-6">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#73185e]/60">Total Estimado</p>
                  <p className="text-2xl font-bold text-[#73185e] tracking-tighter">{formatCurrency(totalPrice)}</p>
                </div>
                
                <button className="w-full py-5 bg-[#73185e] text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#5D134B] transition-all shadow-xl shadow-[#73185e]/20 rounded-sm">
                  Finalizar via WhatsApp
                </button>
                
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
