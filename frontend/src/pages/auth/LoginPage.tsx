import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import PasswordInput from '../../components/auth/PasswordInput';
import GoogleButton from '../../components/auth/GoogleButton';
import AuthDivider from '../../components/auth/AuthDivider';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const result = await login(identifier, password);

    if (!result.success || !result.user) {
      setErrors({ general: result.error || 'Invalid email/phone or password.' });
      setIsSubmitting(false);
      return;
    }

    const loggedUser = result.user;
    setToastMessage(`Welcome back, ${loggedUser.name}! Redirecting...`);

    setTimeout(() => {
      if (loggedUser.role === 'admin' || loggedUser.role === 'superadmin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const fromPath = (location.state as any)?.from?.pathname;
        navigate(fromPath || '/account', { replace: true });
      }
    }, 1000);
  };

  return (
    <AuthLayout type="login">
      <div className="space-y-5">
        {/* Toast / Notification Banner */}
        {toastMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
            <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

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
            Welcome back
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Sign in to access your downloads, orders, or admin dashboard.
          </p>
        </div>

        {/* Quick Demo Credentials Info */}
        <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-[11px] text-amber-900 space-y-1.5">
          <p className="font-bold flex items-center gap-1 text-[#F5A000]">
            <span>⚡</span> Credentials:
          </p>
          <div className="flex flex-col space-y-1 text-[10px]">
            <div>
              <span className="font-extrabold text-purple-900 bg-purple-100 px-1 py-0.5 rounded mr-1">SUPERADMIN:</span>
              <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono select-all text-amber-950">civildigitalstore25@gmail.com</code> | <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono select-all text-amber-950">CivilDigitalStore25@#</code>
            </div>
          </div>
        </div>

        {/* Google CTA Button */}
        <GoogleButton
          onClick={() => {
            setToastMessage('Google Sign-In demo initialized');
            setTimeout(() => setToastMessage(null), 2500);
          }}
        />

        {/* Divider */}
        <AuthDivider text="or sign in with email/phone" />

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email / Phone Field */}
          <AuthInput
            label="Email or Phone"
            type="text"
            placeholder="admin@civildigitalstore.com or 9876543210"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (errors.identifier || errors.general) setErrors((prev) => ({ ...prev, identifier: undefined, general: undefined }));
            }}
            error={errors.identifier}
          />

          {/* Password Field */}
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password || errors.general) setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
            }}
            error={errors.password}
            rightLabelAction={
              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Demo Mode: Default passwords are admin123 (admin) and 12345678 (user).');
                }}
                className="text-xs font-semibold text-[#F5A000] hover:text-amber-600 transition-colors"
              >
                Forgot password?
              </a>
            }
          />

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-[#F5A000] focus:ring-[#F5A000]/20 cursor-pointer accent-[#F5A000]"
            />
            <label htmlFor="remember-me" className="text-xs text-slate-600 font-medium select-none cursor-pointer">
              Remember me for 30 days
            </label>
          </div>

          {/* Primary CTA Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#F5A000] hover:bg-[#e09200] active:bg-[#c98300] disabled:opacity-60 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link: Create Account */}
        <div className="text-center pt-2 text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-[#F5A000] hover:text-amber-600 font-bold transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
