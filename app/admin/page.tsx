"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, onSnapshot, query, orderBy, limit, where, getDocs } from "firebase/firestore";
import { app } from "../../lib/firebase/config";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Order, Product } from "../../types";

export default function AdminDashboard() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [stats, setStats] = useState({ revenue: 0, ordersToday: 0, totalCustomers: 0, totalProducts: 0 });
  const [chartData, setChartData] = useState<{name: string, revenue: number}[]>([]);

  useEffect(() => {
    const db = getFirestore(app);

    const ordersQ = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
    const unsubOrders = onSnapshot(ordersQ, (snap) => {
      const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setRecentOrders(orders);
    });

    const stockQ = query(collection(db, "products"), where("stockQuantity", "<", 10), limit(6));
    getDocs(stockQ).then(snap => {
      setLowStock(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    const fetchStats = async () => {
      const productsSnap = await getDocs(collection(db, "products"));
      const customersSnap = await getDocs(query(collection(db, "users"), where("role", "==", "customer")));
      
      const mockChart = Array.from({length: 7}).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: Math.floor(Math.random() * 500000) + 50000
        };
      });
      setChartData(mockChart);

      setStats({
        revenue: 12540000,
        ordersToday: 42,
        totalCustomers: customersSnap.size,
        totalProducts: productsSnap.size
      });
    };
    fetchStats();

    return () => unsubOrders();
  }, []);

  return (
    <div className="space-y-10">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: `₦${stats.revenue.toLocaleString()}`, icon: "💰" },
          { label: "Orders Today", value: stats.ordersToday.toString(), icon: "🛍️" },
          { label: "Total Customers", value: stats.totalCustomers.toString(), icon: "👥" },
          { label: "Total Products", value: stats.totalProducts.toString(), icon: "📦" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6 hover:shadow-md transition-shadow">
            <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center text-4xl shadow-inner">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900 mb-8 border-b border-gray-100 pb-4">Revenue (Last 7 Days)</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 'bold'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 'bold'}} tickFormatter={(value) => `₦${value/1000}k`} />
                <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '16px', border: '1px solid #F3F4F6', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="revenue" fill="#F5C200" radius={[8, 8, 0, 0]} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col h-full">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
            <span className="text-red-500 bg-red-50 p-2 rounded-xl text-2xl">⚠️</span> 
            Low Stock Alerts
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {lowStock.length === 0 ? (
              <p className="text-gray-500 font-medium text-center py-12 bg-gray-50 rounded-2xl">All products are well stocked.</p>
            ) : lowStock.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white rounded-xl border border-red-100 p-1 flex-shrink-0">
                    <img src={item.imageUrl} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm line-clamp-1 pr-4">{item.name}</p>
                    <p className="text-red-600 font-black text-xs mt-1 bg-red-100 inline-block px-2 py-0.5 rounded-md">{item.stockQuantity} remaining</p>
                  </div>
                </div>
                <button className="text-xs font-black bg-white text-red-600 px-4 py-2 rounded-xl shadow-sm border border-red-200 hover:bg-red-50 transition-colors uppercase tracking-widest">
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-extrabold text-gray-900">Live Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
                <th className="p-6 pl-8">Order ID</th>
                <th className="p-6">Customer</th>
                <th className="p-6">Time</th>
                <th className="p-6">Total Amount</th>
                <th className="p-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-6 pl-8 font-black text-gray-900 text-sm">{order.orderNumber}</td>
                  <td className="p-6 font-bold text-gray-700 text-sm">{order.userEmail}</td>
                  <td className="p-6 text-gray-500 font-semibold text-xs">{order.createdAt ? new Date((order.createdAt as any).toDate()).toLocaleString() : 'Just now'}</td>
                  <td className="p-6 font-black text-brand-600 text-lg">₦{order.total.toLocaleString()}</td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.orderStatus === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.orderStatus === 'processing' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
