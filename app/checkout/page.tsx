"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "../../store/cartStore";
import { AuthContext } from "../../lib/auth/AuthContext";
import { initiatePaystackPayment } from "../../lib/payments/paystack";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
  "Taraba", "Yobe", "Zamfara"
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, tax, total, clearCart } = useCartStore();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    lga: "",
    landmark: "",
    saveAddress: false
  });

  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "pod">("paystack");

  useEffect(() => {
    if (items.length === 0 && step === 1) {
      router.replace("/cart");
    }
    if (user && !address.fullName) {
      setAddress(prev => ({ 
        ...prev, 
        fullName: user.displayName || "", 
        phone: user.phone || "" 
      }));
    }
  }, [items, router, user, step, address.fullName]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!address.fullName || !address.phone || !address.street || !address.city || !address.state) {
        alert("Please fill all required delivery fields.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const orderRef = `GCS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Note: Ideally, create a 'pending' order in Firestore here before opening payment gateway.

      if (paymentMethod === "paystack") {
        initiatePaystackPayment({
          email: user?.email || "guest@goldenchoice.com",
          amount: total,
          reference: orderRef,
          onSuccess: async () => {
            clearCart();
            router.push(`/checkout/success?ref=${orderRef}`);
          },
          onClose: () => {
            setIsProcessing(false);
          }
        });
      } else {
        // Handle Pay on Delivery Firestore creation here
        clearCart();
        router.push(`/checkout/success?ref=${orderRef}&method=pod`);
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert("An error occurred processing your order.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[110px] pb-28 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 relative max-w-xl mx-auto">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-gray-200 -z-10 rounded-full"></div>
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-brand-500 -z-10 rounded-full transition-all duration-500`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
          
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 border-gray-50 transition-colors shadow-sm ${step >= num ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {step > num ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : num}
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs font-bold text-gray-400 mb-10 max-w-xl mx-auto px-2">
          <span className={step >= 1 ? "text-brand-600" : ""}>DELIVERY</span>
          <span className={step >= 2 ? "text-brand-600 text-center" : "text-center"}>PAYMENT</span>
          <span className={step >= 3 ? "text-brand-600 text-right" : "text-right"}>CONFIRM</span>
        </div>

        {/* STEP 1: DELIVERY */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 border-b pb-4">Delivery Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                <input type="text" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" placeholder="080XXXXXXXX" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address *</label>
                <input type="text" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" placeholder="e.g. 12 Awolowo Road, Ikoyi" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                <select value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all">
                  <option value="">Select State</option>
                  {NIGERIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" placeholder="e.g. Lagos" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">LGA (Optional)</label>
                <input type="text" value={address.lga} onChange={e => setAddress({...address, lga: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" placeholder="e.g. Eti-Osa" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nearest Landmark (Optional)</label>
                <input type="text" value={address.landmark} onChange={e => setAddress({...address, landmark: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" placeholder="e.g. Beside GTBank" />
              </div>
              <div className="md:col-span-2 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer text-gray-700 font-bold">
                  <input type="checkbox" checked={address.saveAddress} onChange={e => setAddress({...address, saveAddress: e.target.checked})} className="w-5 h-5 text-brand-500 focus:ring-brand-500 rounded border-gray-300" />
                  Save this address for future orders
                </label>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={handleNextStep} className="bg-gradient-to-r from-brand-500 to-[#C9980A] text-white font-bold py-4 px-10 rounded-xl hover:shadow-brand hover:scale-[1.02] transition-all text-lg border-none">Continue to Payment</button>
            </div>
          </div>
        )}

        {/* STEP 2: PAYMENT */}
        {step === 2 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 border-b pb-4">Payment Method</h2>
            
            <div className="space-y-4 mb-8">
              <label className={`flex items-start gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'paystack' ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-gray-200 hover:border-brand-200 bg-white'}`}>
                <input type="radio" name="payment" value="paystack" checked={paymentMethod === 'paystack'} onChange={() => setPaymentMethod('paystack')} className="mt-1 w-5 h-5 text-brand-500 focus:ring-brand-500" />
                <div className="flex-grow">
                  <span className="block font-extrabold text-lg text-gray-900 mb-1">Pay Now (Securely)</span>
                  <span className="text-sm text-gray-600 block mb-3">Pay securely with your debit/credit card, bank transfer, or USSD via Paystack.</span>
                  <div className="flex gap-2 opacity-80">
                    <div className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-blue-800">VISA</div>
                    <div className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-red-600">Mastercard</div>
                    <div className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-600">Verve</div>
                  </div>
                </div>
              </label>

              <label className={`flex items-start gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'pod' ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-gray-200 hover:border-brand-200 bg-white'}`}>
                <input type="radio" name="payment" value="pod" checked={paymentMethod === 'pod'} onChange={() => setPaymentMethod('pod')} className="mt-1 w-5 h-5 text-brand-500 focus:ring-brand-500" />
                <div>
                  <span className="block font-extrabold text-lg text-gray-900 mb-1">Pay on Delivery</span>
                  <span className="text-sm text-gray-600 block">Pay with cash or POS terminal when your order arrives at your doorstep.</span>
                </div>
              </label>
            </div>

            <details className="mb-8 border-2 border-gray-100 rounded-2xl overflow-hidden group bg-gray-50">
              <summary className="p-5 font-bold text-gray-900 cursor-pointer flex justify-between items-center outline-none">
                <span className="flex items-center gap-2">
                  View Price Breakdown
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-open:rotate-180 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
                <span className="text-brand-600 text-xl font-black">₦{total.toLocaleString()}</span>
              </summary>
              <div className="p-5 bg-white border-t border-gray-100 space-y-3 text-sm text-gray-600 font-medium">
                <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span className="text-gray-900 font-bold">₦{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Delivery Fee</span><span className="text-gray-900 font-bold">₦{deliveryFee.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>VAT (7.5%)</span><span className="text-gray-900 font-bold">₦{tax.toLocaleString()}</span></div>
              </div>
            </details>

            <div className="flex justify-between items-center pt-4">
              <button onClick={() => setStep(1)} className="text-gray-500 font-bold hover:text-gray-900 px-4 py-2">← Back to Delivery</button>
              <button onClick={handleNextStep} className="bg-gradient-to-r from-brand-500 to-[#C9980A] text-white font-bold py-4 px-10 rounded-xl hover:shadow-brand hover:scale-[1.02] transition-all text-lg border-none">Review Order</button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM */}
        {step === 3 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 border-b pb-4">Confirm Your Order</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl relative">
                <button onClick={() => setStep(1)} className="absolute top-4 right-4 text-brand-600 text-sm font-bold hover:underline">Edit</button>
                <h3 className="font-black text-gray-400 text-xs mb-3 uppercase tracking-widest">Delivery Address</h3>
                <div className="text-sm text-gray-800 space-y-1 font-medium">
                  <p className="font-bold text-gray-900 text-base mb-2">{address.fullName}</p>
                  <p>{address.phone}</p>
                  <p className="mt-2">{address.street}</p>
                  <p>{address.city}, {address.state}</p>
                  {address.lga && <p>{address.lga}</p>}
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl relative">
                <button onClick={() => setStep(2)} className="absolute top-4 right-4 text-brand-600 text-sm font-bold hover:underline">Edit</button>
                <h3 className="font-black text-gray-400 text-xs mb-3 uppercase tracking-widest">Payment Method</h3>
                <div className="text-sm text-gray-800 h-full flex flex-col justify-center pb-6">
                  <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {paymentMethod === 'paystack' ? (
                      <><span className="w-3 h-3 bg-green-500 rounded-full block"></span> Secure Online Payment</>
                    ) : (
                      <><span className="w-3 h-3 bg-brand-500 rounded-full block"></span> Pay on Delivery</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="font-black text-gray-400 text-xs mb-3 uppercase tracking-widest">Order Summary</h3>
              <div className="border-2 border-gray-100 rounded-2xl divide-y divide-gray-100 bg-white">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center gap-4 p-4">
                    <div className="relative w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 shrink-0">
                      <Image src={item.imageUrl} alt={item.name} fill unoptimized className="object-contain p-1" />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-sm font-semibold text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-black text-brand-600 text-lg">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-brand-500 p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-center mb-8 text-white shadow-brand">
              <p className="font-bold text-brand-100 mb-2 sm:mb-0">Total Amount</p>
              <p className="text-4xl font-black">₦{total.toLocaleString()}</p>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(2)} disabled={isProcessing} className="text-gray-500 font-bold hover:text-gray-900 px-4 py-2 disabled:opacity-50">← Back</button>
              <button onClick={handlePlaceOrder} disabled={isProcessing} className="bg-gradient-to-r from-brand-500 to-[#C9980A] text-white font-bold py-4 px-12 rounded-xl hover:shadow-brand hover:scale-[1.02] transition-all text-lg flex items-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed border-none">
                {isProcessing && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {isProcessing ? 'Processing Securely...' : 'Place Order Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
