import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../lib/auth/AuthContext";
import { CartProvider } from "../lib/context/CartContext";
import { ToastProvider } from "../lib/context/ToastProvider";
import BottomNav from "../components/layout/BottomNav";
import ChatWidget from "../components/chat/ChatWidget";
import SplashScreen from "./components/SplashScreen";
import Header from "../components/layout/Header";

export const metadata: Metadata = {
  title: "Golden Choice Superstore",
  description: "Nigeria's favourite online superstore",
  other: {
    "app-version": new Date().toISOString()
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(registrations => { registrations.forEach(registration => registration.unregister()); }); }` }} />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <SplashScreen />
              <Header />
              {children}
              <BottomNav />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
