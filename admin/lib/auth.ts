import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { AdminUser, AdminRole } from '../../shared/types';

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string };
    let message = 'Failed to sign in. Please try again.';
    if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/wrong-password') {
      message = 'Invalid email or password.';
    } else if (firebaseError.code === 'auth/user-not-found') {
      message = 'No account found with this email.';
    } else if (firebaseError.code === 'auth/too-many-requests') {
      message = 'Too many failed attempts. Please try again later.';
    }
    return { success: false, error: message };
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to send reset email. Please check the email address.' };
  }
}

export async function getUserRole(uid: string): Promise<AdminRole | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data() as AdminUser;
    if (!data.isActive) return null;
    return data.role;
  } catch {
    return null;
  }
}

export async function getAdminUser(uid: string): Promise<AdminUser | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as AdminUser;
  } catch {
    return null;
  }
}

export { onAuthStateChanged, auth };
export type { User };
