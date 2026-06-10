"use client";

export default function CouponsPage() {
  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Coupons</h1>
          <p className="text-gray-500 font-bold">Manage discount codes and promotions.</p>
        </div>
        <button 
          className="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-sm"
        >
          Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 text-center">
        <p className="text-gray-500 font-bold">Coupons management is coming soon.</p>
      </div>
    </div>
  );
}
