'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { DISTRICT_PROVINCE_MAP } from '../../../shared/types';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';
import { isEmailRegistered } from '../../lib/firestore';
import { sendOTP } from '../../lib/emailjs';

const DISTRICTS = Object.keys(DISTRICT_PROVINCE_MAP).sort();
const SRI_LANKA_PHONE_REGEX = /^0[1-9][0-9]{8}$/;

function SignupForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Verification Wizard States
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpCreatedAt, setOtpCreatedAt] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Count down resend timer
  useEffect(() => {
    if (step !== 'otp' || resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  const validate = (): boolean => {
    if (!firstName.trim()) {
      toast.error('First name is required.');
      return false;
    }
    if (!lastName.trim()) {
      toast.error('Last name is required.');
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const isRegistered = await isEmailRegistered(email.trim());
      if (isRegistered) {
        toast.error('An account already exists with this email address.');
        setIsSubmitting(false);
        return;
      }

      // Generate a 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await sendOTP(email.trim(), code);

      setGeneratedOtp(code);
      setOtpCreatedAt(Date.now());
      setOtpValues(['', '', '', '', '', '']);
      setResendCooldown(60);
      setStep('otp');
      toast.success('Verification code sent to your email!');
    } catch (err: any) {
      console.error('Failed to send OTP:', err);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpValues.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit verification code.');
      return;
    }

    if (code !== generatedOtp) {
      toast.error('Invalid verification code. Please try again.');
      return;
    }

    // Expiry check: 15 minutes = 900,000 ms
    if (Date.now() - otpCreatedAt > 900000) {
      toast.error('Verification code has expired. Please request a new one.');
      return;
    }

    setIsSubmitting(true);
    const address = {
      line1,
      city,
      district,
      province: DISTRICT_PROVINCE_MAP[district] || '',
    };

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const result = await signUp(email.trim(), password, fullName, phone.trim(), address);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Account created and verified successfully!');
      router.push(redirect);
    } else {
      toast.error(result.error || 'Failed to create account.');
      if (result.error?.toLowerCase().includes('already exists') || result.error?.toLowerCase().includes('in-use')) {
        setStep('form');
      }
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await sendOTP(email.trim(), code);

      setGeneratedOtp(code);
      setOtpCreatedAt(Date.now());
      setOtpValues(['', '', '', '', '', '']);
      setResendCooldown(60);
      toast.success('A new verification code has been sent to your email.');
    } catch (err: any) {
      console.error('Failed to resend OTP:', err);
      toast.error('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value && !/^\d+$/.test(value)) return;

    const newValues = [...otpValues];
    const char = value.slice(-1);
    newValues[index] = char;
    setOtpValues(newValues);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newValues = [...otpValues];
      if (otpValues[index]) {
        newValues[index] = '';
        setOtpValues(newValues);
      } else if (index > 0) {
        newValues[index - 1] = '';
        setOtpValues(newValues);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const chars = pastedData.split('');
      setOtpValues(chars);
      inputRefs.current[5]?.focus();
    }
  };

  if (step === 'otp') {
    return (
      <div className="p-4 bg-white rounded-3 shadow-sm animate__animated animate__fadeIn" style={{ border: '1px solid var(--gray-200)' }}>
        <h5 className="mb-3 text-dark text-center" style={{ fontWeight: 700 }}>Verify Your Email</h5>
        <p className="text-center text-danger small" id="dev-otp-code">DEV OTP: {generatedOtp}</p>
        <p className="text-muted text-center mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
          We have sent a 6-digit passcode to <strong style={{ color: 'var(--primary)' }}>{email}</strong>.
          Please enter the code below to complete registration.
        </p>

        {/* 6 Digit Inputs */}
        <div className="d-flex justify-content-center gap-2 mb-4">
          {otpValues.map((val, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={val}
              onChange={(e) => handleOtpChange(e.target.value, idx)}
              onKeyDown={(e) => handleOtpKeyDown(e, idx)}
              onPaste={handleOtpPaste}
              className="form-control text-center"
              style={{
                width: '45px',
                height: '52px',
                fontSize: '22px',
                fontWeight: '700',
                borderRadius: '10px',
                border: val ? '2px solid #00d26a' : '2px solid #ced4da',
                boxShadow: val ? '0 0 8px rgba(0, 210, 106, 0.25)' : 'none',
                transition: 'all 0.2s ease-in-out',
                color: 'var(--dark)'
              }}
            />
          ))}
        </div>

        {/* Verification & Actions */}
        <button
          type="button"
          onClick={handleVerifyOtp}
          disabled={isSubmitting}
          className="btn btn-primary w-100 py-2.5 mb-3"
          style={{ borderRadius: '30px', fontWeight: 700, fontSize: '15px' }}
        >
          {isSubmitting ? (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <Spinner size="sm" color="#fff" />
              Verifying & Registering...
            </span>
          ) : (
            'Verify & Create Account'
          )}
        </button>

        <div className="d-flex justify-content-between align-items-center mt-3" style={{ fontSize: '14px' }}>
          {resendCooldown > 0 ? (
            <span className="text-muted">
              Resend code in <strong>{resendCooldown}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="btn btn-link p-0 text-decoration-none"
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              {isResending ? 'Resending...' : 'Resend Passcode'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setStep('form')}
            className="btn btn-link p-0 text-decoration-none text-secondary"
            style={{ fontWeight: 600 }}
          >
            Back to Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="p-4 bg-white rounded-3 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
      {/* First & Last Name */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="signup-firstname" className="form-label" style={{ fontWeight: 600 }}>First Name</label>
          <input
            id="signup-firstname"
            type="text"
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Kasun"
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="signup-lastname" className="form-label" style={{ fontWeight: 600 }}>Last Name</label>
          <input
            id="signup-lastname"
            type="text"
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Perera"
            required
          />
        </div>
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
            Sending Code...
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
