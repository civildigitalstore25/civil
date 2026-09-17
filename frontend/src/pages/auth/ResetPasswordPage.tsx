import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import { PASSWORD_MIN_LENGTH } from '../../constants/auth';
import { useAuth } from '../../hooks/useAuth';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = searchParams.get('token') || '';

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must contain at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    const result = await resetPassword(token, password);
    if (result.success) {
      setMessage(result.message || 'Password reset successfully.');
    } else {
      setError(result.error || 'Password reset failed.');
    }
  };

  return (
    <AuthLayout type="password">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create a new password</h1>
          <p className="mt-1 text-xs text-slate-500">
            Use at least {PASSWORD_MIN_LENGTH} characters.
          </p>
        </div>
        {!token && (
          <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
            This reset link is incomplete.
          </p>
        )}
        {message && <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">{message}</p>}
        {error && <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              label="New password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
            <button
              type="submit"
              disabled={!token}
              className="w-full rounded-xl bg-[#F5A000] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              Reset password
            </button>
          </form>
        )}
        <Link to="/login" className="block text-center text-xs font-bold text-[#F5A000]">
          Return to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
