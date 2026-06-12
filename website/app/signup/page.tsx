'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { DISTRICT_PROVINCE_MAP } from '../../../shared/types';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

const DISTRICTS = Object.keys(DISTRICT_PROVINCE_MAP).sort();
const SRI_LANKA_PHONE_REGEX = /^0[1-9][0-9]{8}$/;

function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const validate = (): boolean => {
    if (!name.trim()) {
      toast.error('Full name is required.');
      return false;
    }
    if (!phone.trim()) {
      toast.error('Phone number is required.');
      return false;
    }
    if (!SRI_LANKA_PHONE_REGEX.test(phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid Sri Lankan mobile number (e.g., 077XXXXXXX).');
      return false;
    }
    if (!email.trim()) {
      toast.error('Email is required.');
      return false;
    }
    if (!line1.trim() || !city.trim() || !district) {
      toast.error('Please enter your full delivery address.');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const address = {
      line1,
      city,
      district,
      province: DISTRICT_PROVINCE_MAP[district] || '',
    };

    const result = await signUp(email.trim(), password, name.trim(), phone.trim(), address);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Account created successfully!');
      router.push(redirect);
    } else {
      toast.error(result.error || 'Failed to create account.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-3 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
      {/* Name */}
      <div className="mb-3">
        <label htmlFor="signup-name" className="form-label" style={{ fontWeight: 600 }}>Full Name</label>
        <input
          id="signup-name"
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kasun Perera"
          required
        />
      </div>

      <div className="row">
        {/* Email */}
        <div className="col-md-6 mb-3">
          <label htmlFor="signup-email" className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
          <input
            id="signup-email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kasun@example.com"
            required
          />
        </div>

        {/* Phone */}
        <div className="col-md-6 mb-3">
          <label htmlFor="signup-phone" className="form-label" style={{ fontWeight: 600 }}>Phone Number</label>
          <input
            id="signup-phone"
            type="tel"
            className="form-control"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="077XXXXXXX"
            required
          />
        </div>
      </div>

      <hr className="my-3 text-muted" />
      <h6 className="mb-3 text-dark" style={{ fontWeight: 700 }}>Delivery Address Details</h6>

      {/* Address line 1 */}
      <div className="mb-3">
        <label htmlFor="signup-address" className="form-label" style={{ fontWeight: 600 }}>Address Line 1</label>
        <input
          id="signup-address"
          type="text"
          className="form-control"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          placeholder="No 12, Main Street"
          required
        />
      </div>

      <div className="row">
        {/* City */}
        <div className="col-md-6 mb-3">
          <label htmlFor="signup-city" className="form-label" style={{ fontWeight: 600 }}>City</label>
          <input
            id="signup-city"
            type="text"
            className="form-control"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Colombo 03"
            required
          />
        </div>

        {/* District */}
        <div className="col-md-6 mb-3">
          <label htmlFor="signup-district" className="form-label" style={{ fontWeight: 600 }}>District</label>
          <select
            id="signup-district"
            className="form-select"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
          >
            <option value="">Select District</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <hr className="my-3 text-muted" />
      <h6 className="mb-3 text-dark" style={{ fontWeight: 700 }}>Security</h6>

      <div className="row">
        {/* Password */}
        <div className="col-md-6 mb-3">
          <label htmlFor="signup-pass" className="form-label" style={{ fontWeight: 600 }}>Password</label>
          <input
            id="signup-pass"
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 chars"
            required
          />
        </div>

        {/* Confirm password */}
        <div className="col-md-6 mb-4">
          <label htmlFor="signup-conf-pass" className="form-label" style={{ fontWeight: 600 }}>Confirm Password</label>
          <input
            id="signup-conf-pass"
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-100 py-2.5 mb-3"
        style={{ borderRadius: '30px', fontWeight: 700, fontSize: '15px' }}
      >
        {isSubmitting ? (
          <span className="d-flex align-items-center justify-content-center gap-2">
            <Spinner size="sm" color="#fff" />
            Creating Account...
          </span>
        ) : (
          'Register Account'
        )}
      </button>

      <div className="text-center mt-3" style={{ fontSize: '14px' }}>
        Already have an account?{' '}
        <Link href={`/login${searchParams.toString() ? '?' + searchParams.toString() : ''}`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
          Sign In Here
        </Link>
      </div>
    </form>
  );
}

export default function SignupPage() {
  return (
    <section className="section-padding" style={{ minHeight: 'calc(100vh - 120px)', background: 'linear-gradient(135deg, rgba(74,124,89,0.05) 0%, rgba(255,255,255,1) 100%)' }}>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9">
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
              <p className="text-muted">Create Customer Account</p>
            </div>

            <Suspense fallback={
              <div className="text-center p-5">
                <Spinner size="lg" />
              </div>
            }>
              <SignupForm />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
