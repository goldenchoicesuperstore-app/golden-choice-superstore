"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../firebase/config";
import { User } from "../../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, displayName: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userData: User;
        
        if (userDoc.exists()) {
          userData = userDoc.data() as User;
          
          if (firebaseUser.email === 'goldenchoicesuperstore@gmail.com' && userData.role !== 'admin') {
            userData.role = 'admin';
            await setDoc(userDocRef, { role: 'admin' }, { merge: true });
          }
        } else {
          userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: firebaseUser.email === 'goldenchoicesuperstore@gmail.com' ? 'admin' : 'customer',
            phone: firebaseUser.phoneNumber || '',
            createdAt: new Date().toISOString(),
            loyaltyPoints: 0
          };
          await setDoc(userDocRef, userData);
        }
        
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    let userData: User;
    
    if (userDoc.exists()) {
      userData = userDoc.data() as User;
      
      if (firebaseUser.email === 'goldenchoicesuperstore@gmail.com' && userData.role !== 'admin') {
        userData.role = 'admin';
        await setDoc(userDocRef, { role: 'admin' }, { merge: true });
      }
    } else {
      userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        role: firebaseUser.email === 'goldenchoicesuperstore@gmail.com' ? 'admin' : 'customer',
        phone: firebaseUser.phoneNumber || '',
        createdAt: new Date().toISOString(),
        loyaltyPoints: 0
      };
      await setDoc(userDocRef, userData);
    }
    
    setUser(userData);
  };

  const signup = async (email: string, password: string, displayName: string, phone: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;
    
    await updateProfile(firebaseUser, { displayName });
    
    const newUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName,
      photoURL: '',
      role: 'customer',
      phone,
      createdAt: new Date().toISOString(),
      loyaltyPoints: 0
    };
    
    await setDoc(doc(db, "users", firebaseUser.uid), newUser);
    setUser(newUser);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
