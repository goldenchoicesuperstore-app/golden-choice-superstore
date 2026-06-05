"use client";

import React, { createContext, ReactNode } from "react";

export const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  return (
    <CartContext.Provider value={{}}>
      {children}
    </CartContext.Provider>
  );
};
