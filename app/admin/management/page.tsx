"use client";

import { useState, useEffect } from "react";
import { 
  getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc 
} from "firebase/firestore";
import { app } from "../../../lib/firebase/config";
import { useAuth } from "../../../hooks/useAuth";
import { User } from "../../../types";

const ALL_PERMISSIONS = ['products', 'orders', 'customers', 'categories', 'chat', 'settings'];

export default function AdminManagementPage() {
  const { user } = useAuth();
  const db = getFirestore(app);

  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'users'), where('role', '==', 'admin'));
      const snapshot = await getDocs(q);
      const fetchedAdmins: User[] = [];
      snapshot.forEach(doc => {
        fetchedAdmins.push({ id: doc.id, ...doc.data() } as User);
      });
      setAdmins(fetchedAdmins);
    } catch (err: any) {
      setError(err.message || "Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email === 'subomiabayomahmed@gmail.com' && !user.superAdmin) {
      // Bootstrap super admin
      updateDoc(doc(db, 'users', user.id), {
        role: 'admin',
        superAdmin: true,
        permissions: ALL_PERMISSIONS
      }).then(() => {
        window.location.reload();
      }).catch(console.error);
    } else if (user?.superAdmin) {
      fetchAdmins();
    }
  }, [user]);

  if (!user?.superAdmin && user?.email !== 'subomiabayomahmed@gmail.com') {
    return null;
  }

  const superAdminsCount = admins.filter(a => a.superAdmin).length;

  const handleMakeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newAdminEmail.trim()) return;

    try {
      const q = query(collection(db, 'users'), where('email', '==', newAdminEmail.trim().toLowerCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("User not found with this email. They must sign up first.");
        return;
      }

      const userDoc = snapshot.docs[0];
      await updateDoc(userDoc.ref, {
        role: 'admin',
        superAdmin: false,
        permissions: [] // default to no permissions
      });

      setSuccess(`Successfully made ${newAdminEmail} an admin.`);
      setNewAdminEmail("");
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || "Failed to make admin.");
    }
  };

  const handleRemoveAdmin = async (adminId: string, isAdminSelf: boolean) => {
    if (isAdminSelf && !window.confirm("Are you sure you want to remove your own super admin rights? You will lose access immediately.")) {
      return;
    }
    try {
      await updateDoc(doc(db, 'users', adminId), {
        role: 'customer',
        superAdmin: false,
        permissions: []
      });
      if (isAdminSelf) {
        window.location.href = '/';
      } else {
        fetchAdmins();
      }
    } catch (err: any) {
      setError(err.message || "Failed to remove admin.");
    }
  };

  const handleTogglePermission = async (adminId: string, currentPermissions: string[], permission: string) => {
    try {
      let newPermissions = [...(currentPermissions || [])];
      if (newPermissions.includes(permission)) {
        newPermissions = newPermissions.filter(p => p !== permission);
      } else {
        newPermissions.push(permission);
      }

      await updateDoc(doc(db, 'users', adminId), {
        permissions: newPermissions
      });
      
      setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, permissions: newPermissions } : a));
    } catch (err: any) {
      setError(err.message || "Failed to update permissions.");
    }
  };

  const handleMakeSuperAdmin = async (adminId: string) => {
    if (superAdminsCount >= 2) {
      setError("Maximum of 2 super admin slots can be used.");
      return;
    }
    try {
      await updateDoc(doc(db, 'users', adminId), {
        superAdmin: true,
        permissions: ALL_PERMISSIONS
      });
      fetchAdmins();
    } catch (err: any) {
      setError("Failed to make super admin.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Admin Management</h1>
        <p className="text-gray-500">Manage admin roles and section permissions.</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Super Admin Slots</h2>
            <div className="flex items-center gap-4">
              <div className="text-4xl">👑</div>
              <div>
                <p className="text-2xl font-black text-brand-500">{superAdminsCount} / 2</p>
                <p className="text-sm text-gray-500 font-medium">Slots Used</p>
              </div>
            </div>
            {superAdminsCount >= 2 && (
              <p className="text-xs text-orange-500 mt-2 font-medium">All super admin slots are currently occupied.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assign New Admin</h2>
            <form onSubmit={handleMakeAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">User Email</label>
                <input 
                  type="email" 
                  required
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  placeholder="Enter user's email"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-brand-500 text-gray-900 font-bold py-2 rounded-xl hover:bg-brand-400 transition-colors"
              >
                Make Admin
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Current Admins</h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading admins...</div>
            ) : admins.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No admins found.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {admins.map(admin => {
                  const isSelf = admin.id === user?.id;
                  
                  return (
                    <li key={admin.id} className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">{admin.displayName || "Unknown User"}</h3>
                            {isSelf && <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">You</span>}
                            {admin.superAdmin && <span className="bg-[#FFF8D6] text-[#B8860B] text-xs font-bold px-2 py-1 rounded-full border border-[#FFE566]">Super Admin 👑</span>}
                          </div>
                          <p className="text-gray-500 text-sm">{admin.email}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!admin.superAdmin && superAdminsCount < 2 && (
                            <button 
                              onClick={() => handleMakeSuperAdmin(admin.id)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                            >
                              Make Super
                            </button>
                          )}
                          <button 
                            onClick={() => handleRemoveAdmin(admin.id, isSelf)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                          >
                            Remove Admin
                          </button>
                        </div>
                      </div>

                      {!admin.superAdmin && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Permissions</p>
                          <div className="flex flex-wrap gap-3">
                            {ALL_PERMISSIONS.map(permission => {
                              const hasPerm = admin.permissions?.includes(permission);
                              return (
                                <label key={permission} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-brand-300 transition-colors">
                                  <input 
                                    type="checkbox"
                                    checked={hasPerm || false}
                                    onChange={() => handleTogglePermission(admin.id, admin.permissions || [], permission)}
                                    className="rounded text-brand-500 focus:ring-brand-500 border-gray-300"
                                  />
                                  <span className="text-sm font-medium text-gray-700 capitalize">{permission}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
