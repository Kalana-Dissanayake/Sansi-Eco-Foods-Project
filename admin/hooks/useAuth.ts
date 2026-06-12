'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getUserRole, getAdminUser } from '../lib/auth';
import type { User } from 'firebase/auth';
import type { AdminUser, AdminRole } from '../../shared/types';

interface AuthState {
  user: User | null;
  adminUser: AdminUser | null;
  role: AdminRole | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    adminUser: null,
    role: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const [role, adminUser] = await Promise.all([
          getUserRole(user.uid),
          getAdminUser(user.uid),
        ]);

        setState({
          user,
          adminUser,
          role,
          loading: false,
          isAuthenticated: !!role,
        });
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

  return state;
}

