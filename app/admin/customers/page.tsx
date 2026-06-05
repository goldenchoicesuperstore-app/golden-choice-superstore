"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "../../../lib/firebase/config";
import { User } from "../../../types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      const db = getFirestore(app);
      const q = query(collection(db, "users"), where("role", "==", "customer"));
      const snap = await getDocs(q);
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const term = search.toLowerCase();
    return c.email?.toLowerCase().includes(term) || c.displayName?.toLowerCase().includes(term);
  });

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[calc(100vh-8rem)]">
      <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gray-50/30">
        <h1 className="text-2xl font-extrabold text-gray-900">Manage Customers</h1>
        
        <div className="relative w-full sm:w-80">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-bold w-full focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
              <th className="p-6 pl-8">Customer Name</th>
              <th className="p-6">Email Address</th>
              <th className="p-6">Phone Number</th>
              <th className="p-6">Loyalty Points</th>
              <th className="p-6 pr-8">Join Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="p-16 text-center text-gray-400 font-bold text-lg">Loading customers...</td></tr>
            ) : filteredCustomers.length === 0 ? (
              <tr><td colSpan={5} className="p-16 text-center text-gray-400 font-bold text-lg">No customers found.</td></tr>
            ) : filteredCustomers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="p-6 pl-8 font-extrabold text-gray-900 text-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-black text-lg border border-brand-100 shadow-sm">
                    {(customer.displayName || 'U')[0].toUpperCase()}
                  </div>
                  {customer.displayName || 'Unknown'}
                </td>
                <td className="p-6 font-bold text-gray-600 text-sm">{customer.email}</td>
                <td className="p-6 font-bold text-gray-600 text-sm">{customer.phone || 'N/A'}</td>
                <td className="p-6">
                  <span className="font-black text-brand-600 text-base bg-brand-50 px-3 py-1 rounded-lg border border-brand-100 shadow-sm">{customer.loyaltyPoints || 0} pts</span>
                </td>
                <td className="p-6 pr-8 text-gray-500 text-xs font-bold uppercase tracking-wider">{customer.createdAt ? new Date((customer.createdAt as any).toDate()).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
