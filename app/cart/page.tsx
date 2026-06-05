"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "../../store/cartStore";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, tax, total, updateQuantity, removeItem } = useCartStore();
  const [couponCode, setCouponCode] = useState("");

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-8xl mb-6 opacity-80">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-sm">Looks like you haven't added anything to your cart yet. Discover our top products and deals today!</p>
        <Link href="/home" className="bg-brand-500 text-white font-bold py-4 px-10 rounded-full hover:bg-brand-600 transition-colors shadow-brand hover:shadow-lg">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[110px] pb-28 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <span className="text-gray-500 font-medium">{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {items.map((item) => (
              <div key={item.productId} className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b border-gray-100 last:border-0 relative">
                <div className="relative w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  <Image src={item.imageUrl || "https://placehold.co/400"} alt={item.name} fill unoptimized className="object-contain p-2 mix-blend-multiply" />
                </div>
                
                <div className="flex-grow flex flex-col h-full w-full">
                  <h3 className="text-gray-900 font-bold mb-1 line-clamp-2 pr-8">{item.name}</h3>
                  <span className="text-brand-600 font-black text-lg mb-4">₦{item.price.toLocaleString()}</span>
                  
                  <div className="flex items-center justify-between mt-auto">
                    {/* Quantity Selector */}
                    <div className="flex items-center border-2 border-gray-100 rounded-lg overflow-hidden h-10">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-3 h-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-lg"
                      >-</button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 h-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-lg"
                      >+</button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-semibold sm:absolute sm:top-4 sm:right-4"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      <span className="sm:hidden">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 inline-block">
            <Link href="/home" className="text-brand-600 font-bold hover:underline flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-gray-600 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-bold text-gray-900">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-gray-900">
                  {deliveryFee === 0 ? <span className="text-green-600">Free</span> : `₦${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>VAT (7.5%)</span>
                <span className="font-bold text-gray-900">₦{tax.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-bold text-lg">Total</span>
                <span className="text-3xl font-black text-brand-500">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Coupon code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                />
                <button className="bg-gray-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
                  Apply
                </button>
              </div>
            </div>

            <button 
              onClick={() => router.push("/checkout")}
              disabled={items.length === 0}
              className="w-full bg-brand-500 text-white font-bold text-lg py-4 rounded-xl shadow-brand hover:shadow-lg hover:bg-brand-600 transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
