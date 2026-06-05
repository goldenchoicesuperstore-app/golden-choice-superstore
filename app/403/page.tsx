import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-10 text-center border border-gray-100 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner border border-red-100">
          ⚠️
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Access Denied</h1>
        
        <p className="text-gray-500 font-bold mb-10 leading-relaxed text-sm">
          You do not have the required permissions to view this page. This area is strictly restricted to administrators only.
        </p>
        
        <Link 
          href="/home" 
          className="block w-full bg-brand-500 text-white font-extrabold text-sm py-4 rounded-2xl shadow-brand hover:bg-brand-600 hover:shadow-lg transition-all uppercase tracking-widest"
        >
          Return to Store
        </Link>
      </div>
    </div>
  );
}
