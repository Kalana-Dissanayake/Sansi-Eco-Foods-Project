'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy redirect: /messages → /notifications
 * This keeps any bookmarked or direct links working.
 */
export default function MessagesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/notifications');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Redirecting to Notifications…</p>
      </div>
    </div>
  );
}
