import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "NewBeach | Moda Feminina Sofisticada",
  description: "Descubra o minimalismo sofisticado da NewBeach. Linho, Alfaiataria e Curadoria de Qualidade.",
  keywords: ["moda feminina", "linho", "alfaiataria", "clean girl aesthetic", "roupas minimalistas"],
};

import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/client/CartDrawer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} ${playfair.variable} antialiased bg-[#D1C0DB]`}>
        <CartProvider>
          <CartDrawer />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
