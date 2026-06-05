import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth/AuthContext";
import { CartProvider } from "../lib/context/CartContext";
import { ToastProvider } from "../lib/context/ToastProvider";
import BottomNav from "../components/layout/BottomNav";
import ChatWidget from "../components/chat/ChatWidget";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Golden Choice Superstore",
  description: "Nigeria's favourite online superstore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              {children}
              <ChatWidget />
              <BottomNav />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
