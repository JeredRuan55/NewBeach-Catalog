"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface ShippingAddress {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  // Shipping
  shippingFee: number;
  shippingAddress: ShippingAddress | null;
  setShipping: (address: ShippingAddress, fee: number) => void;
  clearShipping: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);

  // Load cart and shipping from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('newbeach-cart');
    const savedShipping = localStorage.getItem('newbeach-shipping');
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) { console.error("Failed to parse cart", e); }
    }

    if (savedShipping) {
      try {
        const parsed = JSON.parse(savedShipping);
        setShippingAddress(parsed.address);
        setShippingFee(parsed.fee);
      } catch (e) { console.error("Failed to parse shipping", e); }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('newbeach-cart', JSON.stringify(cart));
  }, [cart]);

  // Save shipping to localStorage on change
  useEffect(() => {
    if (shippingAddress) {
      localStorage.setItem('newbeach-shipping', JSON.stringify({
        address: shippingAddress,
        fee: shippingFee
      }));
    } else {
      localStorage.removeItem('newbeach-shipping');
    }
  }, [shippingAddress, shippingFee]);

  const addItem = (item: CartItem) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(i => i.id === item.id);
      if (existingItem) {
        return currentCart.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...currentCart, item];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setCart(currentCart => currentCart.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setCart(currentCart => 
      currentCart.map(i => i.id === id ? { ...i, quantity } : i)
    );
  };

  const clearCart = () => {
    setCart([]);
    clearShipping();
  };
  
  const setShipping = (address: ShippingAddress, fee: number) => {
    setShippingAddress(address);
    setShippingFee(fee);
  };

  const clearShipping = () => {
    setShippingAddress(null);
    setShippingFee(0);
  };

  const toggleCart = () => setIsOpen(!isOpen);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, addItem, removeItem, updateQuantity, clearCart, 
      totalItems, totalPrice, isOpen, toggleCart, openCart, closeCart,
      shippingFee, shippingAddress, setShipping, clearShipping
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
