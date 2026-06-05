"use client";

import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { app } from "../../../lib/firebase/config";
import { Order } from "../../../types";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestore(app);
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const db = getFirestore(app);
      await updateDoc(doc(db, "orders", orderId), { orderStatus: newStatus });
      // Send notification to customer
      await updateDoc(doc(db, "notifications", doc(collection(db, "notifications")).id), {
        userId: orders.find(o => o.id === orderId)?.userId,
        title: "Order Update",
        body: `Your order ${orderId} is now ${newStatus}`,
        type: "order_update",
        isRead: false,
        createdAt: new Date()
      }).catch(e => console.log("Notif error ignored", e)); 
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[calc(100vh-8rem)]">
      <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Manage Orders</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
              <th className="p-6 pl-8">Order Number</th>
              <th className="p-6">Customer</th>
              <th className="p-6">Date</th>
              <th className="p-6">Total Amount</th>
              <th className="p-6">Payment</th>
              <th className="p-6">Order Status</th>
              <th className="p-6 pr-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={7} className="p-16 text-center text-gray-400 font-bold text-lg">Loading orders...</td></tr> : null}
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className={`hover:bg-gray-50/80 cursor-pointer transition-colors ${expandedId === order.id ? 'bg-gray-50/80' : ''}`}>
                  <td className="p-6 pl-8 font-black text-gray-900 text-sm">{order.orderNumber}</td>
                  <td className="p-6">
                    <p className="font-extrabold text-gray-900 text-sm">{order.userEmail}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">{order.userPhone}</p>
                  </td>
                  <td className="p-6 text-gray-500 text-xs font-bold">{order.createdAt ? new Date((order.createdAt as any).toDate()).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-6 font-black text-brand-600 text-lg">₦{order.total.toLocaleString()}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${order.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-6">
                    <select 
                      value={order.orderStatus} 
                      onChange={(e) => { e.stopPropagation(); handleUpdateStatus(order.id!, e.target.value); }}
                      className={`border rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-2 outline-none cursor-pointer transition-colors ${
                        order.orderStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500/20' :
                        order.orderStatus === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500/20' :
                        order.orderStatus === 'processing' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-500/20' :
                        order.orderStatus === 'shipped' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-500/20' :
                        order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-500/20' :
                        'bg-red-50 text-red-700 border-red-200 focus:ring-red-500/20'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-6 pr-8 text-right text-gray-400">
                    <div className={`w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center ml-auto transition-transform ${expandedId === order.id ? 'rotate-180 bg-gray-100' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                    </div>
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr className="bg-gray-50/50">
                    <td colSpan={7} className="p-8 border-b border-gray-200 shadow-inner">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                          <h4 className="font-black text-gray-400 mb-4 uppercase text-[10px] tracking-widest">Purchased Items</h4>
                          <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-50 rounded-lg p-1 border border-gray-100"><img src={item.imageUrl} className="w-full h-full object-contain mix-blend-multiply" /></div>
                                  <span className="font-bold text-gray-900">{item.quantity}x {item.name}</span>
                                </div>
                                <span className="font-black text-brand-600 text-base">₦{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-black text-gray-400 mb-4 uppercase text-[10px] tracking-widest">Delivery Address</h4>
                          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-700 font-medium leading-relaxed">
                            <p className="font-extrabold text-gray-900 text-base mb-1">{order.shippingAddress?.fullName}</p>
                            <p>{order.shippingAddress?.street}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                            {order.shippingAddress?.lga && <p>{order.shippingAddress?.lga} LGA</p>}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
