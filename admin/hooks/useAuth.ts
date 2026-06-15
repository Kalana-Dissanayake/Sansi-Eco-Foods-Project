'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getAdminUser, getUserRoleDetails } from '../lib/auth';
import type { User } from 'firebase/auth';
import type { AdminUser, Role, RolePermissions } from '../../shared/types';

interface AuthState {
  user: User | null;
  adminUser: AdminUser | null;
  role: Role | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permissionName: keyof RolePermissions) => boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<Omit<AuthState, 'hasPermission'>>({
    user: null,
    adminUser: null,
    role: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const [role, adminUser] = await Promise.all([
            getUserRoleDetails(user.uid),
            getAdminUser(user.uid),
          ]);

          setState({
            user,
            adminUser,
            role,
            loading: false,
            isAuthenticated: !!role,
          });
        } catch (err) {
          console.error('Error loading auth role details:', err);
          setState({
            user,
            adminUser: null,
            role: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setState({
          user: null,
          adminUser: null,
          role: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    });

    return unsubscribe;
  }, []);

  const hasPermission = (permissionName: keyof RolePermissions): boolean => {
    if (!state.role) return false;
    if (state.role.id === 'super_admin') return true;
    return !!state.role.permissions?.[permissionName];
  };

  return {
    ...state,
    hasPermission,
  };
}

