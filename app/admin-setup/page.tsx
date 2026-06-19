"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '../../lib/firebase/config';

export default function AdminSetupPage() {
  const { user, isLoading } = useAuthStore();
  const [status, setStatus] = useState('Checking authorization...');

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setStatus('Not authorized');
      return;
    }

    if (user.email === 'subomiabayomahmed@gmail.com') {
      const makeAdmin = async () => {
        setStatus('Setting up super admin access...');
        try {
          const db = getFirestore(app);
          // Assuming user.id is the document ID in 'users' collection
          const userRef = doc(db, 'users', user.id);
          
          await updateDoc(userRef, {
            superAdmin: true,
            role: 'admin',
            permissions: []
          });
          
          setStatus('Success! Super admin access granted. The fields were successfully set.');
        } catch (error) {
          console.error('Error setting admin:', error);
          setStatus(`Error: ${(error as Error).message}`);
        }
      };

      makeAdmin();
    } else {
      setStatus('Not authorized');
    }
  }, [user, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-4">Admin Setup</h1>
        <p className={`font-bold ${status.includes('Success') ? 'text-green-600' : status.includes('Not authorized') ? 'text-red-600' : 'text-gray-600'}`}>
          {status}
        </p>
      </div>
    </div>
  );
}
