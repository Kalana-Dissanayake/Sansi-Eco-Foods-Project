'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { signIn, sendPasswordReset } from '../../lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.success) {
      router.push('/dashboard');
    } else {
      toast.error(result.error ?? 'Login failed');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    const result = await sendPasswordReset(resetEmail.trim());
    setResetLoading(false);
    if (result.success) {
      toast.success(
        'Password reset link requested! Please check your inbox and Spam/Junk folder.',
        { duration: 6000 }
      );
      setShowReset(false);
    } else {
      toast.error(result.error ?? 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="/images/sansi-logo.png"
              alt="Sansi Eco Foods Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wider" style={{ fontFamily: 'var(--font-open-sans), sans-serif' }}>
            <span style={{ color: '#ff6a00' }}>SANSI</span>{' '}
            <span style={{ color: '#00d26a' }}>ECO</span>{' '}
            <span style={{
              background: 'linear-gradient(to right, #ff6a00, #00d26a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>FOODS</span>
          </h1>
          <p className="text-green-200 mt-1">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {!showReset ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Sign in to your account</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sansiecofoods.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </button>
              </form>

              <div className="text-center mt-4">
                <button
                  onClick={() => setShowReset(true)}
                  className="text-sm text-green-700 hover:text-green-900 hover:underline transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Reset Password</h2>
              <p className="text-gray-500 text-sm mb-4">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@sansiecofoods.com"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-60 text-sm"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </form>
              
              <div className="mt-5 p-3.5 bg-amber-50 rounded-xl text-xs text-amber-800 border border-amber-100 space-y-1 text-left">
                <p className="font-semibold text-amber-900">Trouble receiving the link?</p>
                <ul className="list-disc list-inside space-y-1 text-amber-800/90">
                  <li>Check your <strong>Spam or Junk folder</strong>.</li>
                  <li>Verify that the email is spelled exactly correct.</li>
                  <li>Ensure the email is registered in the <strong>Firebase Auth Console</strong>. (Firebase protects against email enumeration and will report success even if the email does not exist).</li>
                </ul>
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={() => setShowReset(false)}
                  className="text-sm text-green-700 hover:underline font-medium"
                >
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-green-200/60 text-xs mt-6">
          Sansi Eco Foods © {new Date().getFullYear()} — Authorized access only
        </p>
      </div>
    </div>
  );
}
