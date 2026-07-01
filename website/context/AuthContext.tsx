'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getCustomerProfile, createCustomerProfile, updateCustomerProfile } from '../lib/firestore';
import { db } from '../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { Customer, DeliveryAddress } from '../../shared/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string,
    address: DeliveryAddress
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (
    name: string,
    phone: string,
    address: DeliveryAddress
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch customer profile details
        const profile = await getCustomerProfile(firebaseUser.uid);
        if (profile) {
          setUser(firebaseUser);
          setCustomer(profile);
        } else {
          // If no customer profile exists in /customers (e.g., they logged in with admin credentials),
          // treat them as logged out on the storefront.
          setUser(null);
          setCustomer(null);
        }
      } else {
        setUser(null);
        setCustomer(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch customer profile details to verify they are a registered customer
      const profile = await getCustomerProfile(credential.user.uid);
      if (!profile) {
        // Sign out if they are not in the /customers collection (e.g. admin accounts)
        await firebaseSignOut(auth);
        return {
          success: false,
          error: 'Access denied. Admin accounts cannot log in as customers on the storefront.',
        };
      }
      return { success: true };
    } catch (error: any) {
      console.error('Sign-in error:', error);
      let message = 'Failed to sign in. Please try again.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      }
      return { success: false, error: message };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    address: DeliveryAddress
  ) => {
    try {
      // 1. Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Create customer profile in Firestore
      await createCustomerProfile(credential.user.uid, {
        name,
        phone,
        email,
        address,
      });

      // 3. Fire new_customer notification (non-blocking)
      addDoc(collection(db, 'notifications'), {
        type: 'new_customer',
        title: 'New Customer Registered',
        body: `${name} created a new account (${email}).`,
        customerId: credential.user.uid,
        customerName: name,
        linkTo: `/customers`,
        read: false,
        createdAt: serverTimestamp(),
      }).catch((err) => console.error('Failed to create new_customer notification:', err));

      // 4. Update local state
      const profile = await getCustomerProfile(credential.user.uid);
      setCustomer(profile);

      return { success: true };
    } catch (error: any) {
      console.error('Sign-up error:', error);
      let message = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account already exists with this email address.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setCustomer(null);
    toast.success('Signed out successfully.');
  };

  const updateProfile = async (name: string, phone: string, address: DeliveryAddress) => {
    if (!user) return { success: false, error: 'User is not logged in.' };
    try {
      await updateCustomerProfile(user.uid, {
        name,
        phone,
        email: user.email || '',
        address,
      });

      // Fetch fresh profile details
      const profile = await getCustomerProfile(user.uid);
      setCustomer(profile);

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile details. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
