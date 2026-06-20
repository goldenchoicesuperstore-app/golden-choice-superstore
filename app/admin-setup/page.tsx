"use client";

import { useEffect, useState } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../lib/firebase/config';

export default function AdminSetupPage() {
  const [status, setStatus] = useState('Checking authorization...');

  useEffect(() => {
    console.log('Admin Setup: Attaching auth listener...');
    const auth = getAuth(app);
    
    // Set a 5 second timeout to catch hanging auth states
    const timeoutId = setTimeout(() => {
      console.log('Admin Setup: 5 second timeout reached');
      setStatus(prev => {
        if (prev === 'Checking authorization...') {
          return 'Error: Authorization timed out. Please ensure you are logged in and refresh the page.';
        }
        return prev;
      });
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeoutId);
      
      if (user) {
        console.log('Admin Setup: User detected:', user.email);
        
        if (user.email === 'sparkstonecreatives@gmail.com') {
          console.log('Admin Setup: Email verified. Proceeding to update Firestore...');
          
          const makeAdmin = async () => {
            setStatus('Setting up super admin access...');
            try {
              const db = getFirestore(app);
              const userRef = doc(db, 'users', user.uid);
              
              console.log('Admin Setup: Writing to Firestore...');
              await updateDoc(userRef, {
                superAdmin: true,
                role: 'admin',
                permissions: []
              });
              
              console.log('Admin Setup: Firestore write successful.');
              setStatus('Success! Super admin access granted. The fields were successfully set.');
            } catch (error) {
              console.error('Admin Setup: Error setting admin:', error);
              setStatus(`Error: ${(error as Error).message}`);
            }
          };

          makeAdmin();
        } else {
          console.log('Admin Setup: Email check failed for:', user.email);
          setStatus('Not authorized');
        }
      } else {
        console.log('Admin Setup: No user detected');
        setStatus('Not authorized: No user logged in');
      }
    });

    return () => {
      console.log('Admin Setup: Detaching auth listener...');
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-4">Admin Setup</h1>
        <p className={`font-bold ${status.includes('Success') ? 'text-green-600' : status.includes('Not authorized') || status.includes('Error') ? 'text-red-600' : 'text-gray-600'}`}>
          {status}
        </p>
      </div>
    </div>
  );
}
