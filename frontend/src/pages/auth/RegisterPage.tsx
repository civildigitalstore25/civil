import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import PasswordInput from '../../components/auth/PasswordInput';
import GoogleButton from '../../components/auth/GoogleButton';
import AuthDivider from '../../components/auth/AuthDivider';
import { useAuth } from '../../hooks/useAuth';
import {
  AUTH_ROUTES,
  AUTH_SUCCESS_MESSAGES,
  PHONE_PATTERN,
} from '../../constants/auth';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, googleSignIn } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  interface Errors {
    fullName?: string;
    email?: string;
    mobileNumber?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
    general?: string;
  }

  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!PHONE_PATTERN.test(mobileNumber.replace(/[\s-]/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must contain at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'Please accept Terms of Service';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const result = await register({
      fullName: fullName.trim(),
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      password,
    });

    if (!result.success || !result.user) {
      setErrors({ general: result.error || 'Registration failed. Please try again.' });
      setIsSubmitting(false);
      return;
    }

    navigate(AUTH_ROUTES.home, {
      replace: true,
      state: { authMessage: AUTH_SUCCESS_MESSAGES.register },
    });
  };

  const handleGoogleCredential = async (credential: string) => {
    const result = await googleSignIn(credential);
    if (result.success) {
      navigate(AUTH_ROUTES.home, {
        replace: true,
        state: { authMessage: AUTH_SUCCESS_MESSAGES.google },
      });
    } else {
      setErrors({ general: result.error || 'Google sign-up failed.' });
    }
  };

  return (
    <AuthLayout type="register">
      <div className="space-y-4">
        {/* General Error Banner */}
        {errors.general && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{errors.general}</span>
          </div>
        )}

        {/* Page Heading & Subtitle */}
        <div className="space-y-1 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Create your account
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Free account setup. Instant download access after registration.
          </p>
        </div>

        <GoogleButton
          onCredential={handleGoogleCredential}
          onError={() => setErrors({ general: 'Google sign-up was cancelled or failed.' })}
        />
        <AuthDivider text="or create an account with email" />

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <AuthInput
            label="Full Name"
            type="text"
            placeholder="Rahul Sharma"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName || errors.general) setErrors((prev) => ({ ...prev, fullName: undefined, general: undefined }));
            }}
            error={errors.fullName}
          />

          {/* Email Address */}
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email || errors.general) setErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
            }}
            error={errors.email}
          />

          {/* Mobile Number with IN +91 Prefix */}
          <AuthInput
            label="Mobile Number"
            type="tel"
            placeholder="9876543210"
            prefixElement={<span className="font-semibold text-slate-600">IN +91</span>}
            value={mobileNumber}
            onChange={(e) => {
              setMobileNumber(e.target.value);
              if (errors.mobileNumber || errors.general) setErrors((prev) => ({ ...prev, mobileNumber: undefined, general: undefined }));
            }}
            error={errors.mobileNumber}
          />

          {/* Password */}
          <PasswordInput
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password || errors.general) setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
            }}
            error={errors.password}
          />

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword || errors.general) setErrors((prev) => ({ ...prev, confirmPassword: undefined, general: undefined }));
            }}
            error={errors.confirmPassword}
          />

          {/* Terms & Privacy Checkbox */}
          <div className="space-y-1">
            <div className="flex items-start gap-2 pt-0.5">
              <input
                id="terms-checkbox"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms || errors.general) setErrors((prev) => ({ ...prev, agreeTerms: undefined, general: undefined }));
                }}
                className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 text-[#F5A000] focus:ring-[#F5A000]/20 cursor-pointer accent-[#F5A000] shrink-0"
              />
              <label htmlFor="terms-checkbox" className="text-xs text-slate-600 font-normal leading-tight select-none cursor-pointer">
                I agree to the{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()} className="text-[#F5A000] font-semibold hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-[#F5A000] font-semibold hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-[11px] text-red-600 font-medium pl-1">{errors.agreeTerms}</p>
            )}
          </div>

          {/* Primary CTA Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#F5A000] hover:bg-[#e09200] active:bg-[#c98300] disabled:opacity-60 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            {isSubmitting ? 'Creating Account...' : "Create Account — It's Free"}
          </button>
        </form>

        {/* Footer Link: Sign In */}
        <div className="text-center pt-1 text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[#F5A000] hover:text-amber-600 font-bold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
