import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { AdminUser, Role } from '../../shared/types';

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

export async function getUserRole(uid: string): Promise<string | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data() as AdminUser;
    if (!data.isActive) return null;
    return data.roleId || data.role || null;
  } catch {
    return null;
  }
}

export async function getUserRoleDetails(uid: string): Promise<Role | null> {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return null;
    const userData = userSnap.data() as AdminUser;
    if (!userData.isActive) return null;

    const roleId = userData.roleId || userData.role;
    if (!roleId) return null;

    const roleSnap = await getDoc(doc(db, 'roles', roleId));
    if (roleSnap.exists()) {
      return { id: roleSnap.id, ...roleSnap.data() } as Role;
    }

    // Legacy / initial setup fallback for super_admin
    if (roleId === 'super_admin') {
      return {
        id: 'super_admin',
        name: 'Super Admin',
        description: 'System Owner with full access',
        isActive: true,
        isSystem: true,
        permissions: {
          dashboard_view: true,
          dashboard_export_analytics: true,
          orders_view: true,
          orders_edit: true,
          orders_update_status: true,
          orders_refund: true,
          orders_delivery_queue: true,
          menu_view: true,
          menu_edit: true,
          menu_toggle_stock: true,
          customers_view: true,
          customers_edit: true,
          coupons_manage: true,
          settings_manage: true,
          staff_manage: true,
        },
        createdAt: userData.createdAt,
        updatedAt: userData.createdAt,
      } as Role;
    }

    return null;
  } catch (err) {
    console.error('Error fetching user role details:', err);
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
