import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthInput from '../../components/auth/AuthInput';
import AuthLayout from '../../components/auth/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = await forgotPassword(email.trim());
    setIsSubmitting(false);
    if (result.success) {
      setMessage(result.message || 'Check your email for a password reset link.');
    } else {
      setError(result.error || 'Unable to request a password reset.');
    }
  };

  return (
    <AuthLayout type="password">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
          <p className="mt-1 text-xs text-slate-500">
            Enter your account email and we will send a secure reset link.
          </p>
        </div>
        {message && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#F5A000] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <Link to="/login" className="block text-center text-xs font-bold text-[#F5A000]">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
