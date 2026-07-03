'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const { signIn, resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Signed in successfully!');
      router.push(redirect);
    } else {
      toast.error(result.error || 'Invalid credentials.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(email.trim());
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Password reset link sent! Please check your inbox.');
      setMode('login');
    } else {
      toast.error(result.error || 'Failed to send reset link.');
    }
  };

  if (mode === 'forgot') {
    return (
      <form onSubmit={handleResetSubmit} className="p-4 bg-white rounded-3 shadow-sm login-card" style={{ border: '1px solid var(--gray-200)' }}>
        <h5 className="mb-3 text-dark text-center" style={{ fontWeight: 700 }}>Reset Password</h5>
        <p className="text-muted text-center mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
          Enter the email address associated with your account, and we will send you a password reset link.
        </p>

        <div className="form-floating mb-4">
          <input
            id="reset-email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@example.com"
            required
          />
          <label htmlFor="reset-email" style={{ color: '#666' }}>Email Address</label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary w-100 py-2.5 mb-3 btn-signin"
          style={{ borderRadius: '30px', fontWeight: 700, fontSize: '15px' }}
        >
          {isSubmitting ? (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <Spinner size="sm" color="#fff" />
              Sending Reset Link...
            </span>
          ) : (
            'Send Reset Link'
          )}
        </button>

        <div className="text-center mt-3" style={{ fontSize: '14px' }}>
          <button
            type="button"
            onClick={() => setMode('login')}
            className="btn btn-link p-0 text-decoration-none auth-link"
            style={{ color: 'var(--primary)', fontWeight: 600 }}
          >
            Back to Login
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-3 shadow-sm login-card" style={{ border: '1px solid var(--gray-200)' }}>
      <div className="form-floating mb-3">
        <input
          id="login-email"
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@example.com"
          required
        />
        <label htmlFor="login-email" style={{ color: '#666' }}>Email Address</label>
      </div>

      <div className="form-floating mb-2">
        <input
          id="login-password"
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <label htmlFor="login-password" style={{ color: '#666' }}>Password</label>
      </div>

      <div className="text-end mb-4">
        <button
          type="button"
          onClick={() => setMode('forgot')}
          className="btn btn-link p-0 text-decoration-none auth-link"
          style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600 }}
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-100 py-2.5 mb-3 btn-signin"
        style={{ borderRadius: '30px', fontWeight: 700, fontSize: '15px' }}
      >
        {isSubmitting ? (
          <span className="d-flex align-items-center justify-content-center gap-2">
            <Spinner size="sm" color="#fff" />
            Signing In...
          </span>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="text-center mt-3" style={{ fontSize: '14px' }}>
        Don&apos;t have an account?{' '}
        <Link href={`/signup${searchParams.toString() ? '?' + searchParams.toString() : ''}`} className="auth-link" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          Sign Up Here
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <section className="section-padding" style={{ minHeight: 'calc(100vh - 120px)', background: 'linear-gradient(135deg, rgba(74,124,89,0.05) 0%, rgba(255,255,255,1) 100%)' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center mb-3">
                <img
                  src="/images/sansi-logo.png"
                  alt="Sansi Eco Foods Logo"
                  style={{ height: '60px' }}
                />
              </div>
              <h2 className="mb-2" style={{
                fontFamily: 'var(--font-open-sans), sans-serif',
                fontWeight: 800,
                fontSize: '26px',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <span style={{ color: '#ff6a00' }}>SANSI</span>
                <span style={{ color: '#00d26a' }}>ECO</span>
                <span style={{
                  background: 'linear-gradient(to right, #ff6a00, #00d26a)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>FOODS</span>
              </h2>
              <p className="text-muted">Customer Login</p>
            </div>

            <Suspense fallback={
              <div className="text-center p-5">
                <Spinner size="lg" />
              </div>
            }>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
