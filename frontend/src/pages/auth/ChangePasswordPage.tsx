import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import PasswordInput from '../../components/auth/PasswordInput';
import { PASSWORD_MIN_LENGTH } from '../../constants/auth';
import { useAuth } from '../../hooks/useAuth';

export default function ChangePasswordPage() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setError(`New password must contain at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmation) {
      setError('New passwords do not match.');
      return;
    }
    const result = await changePassword({ currentPassword, newPassword });
    if (!result.success) {
      setError(result.error || 'Password change failed.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setMessage(result.message || 'Password changed successfully.');
  };

  return (
    <AuthLayout type="password">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Change password</h1>
          <p className="mt-1 text-xs text-slate-500">
            Confirm your current password before choosing a new one.
          </p>
        </div>
        {message && <p className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">{message}</p>}
        {error && <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Current password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-[#F5A000] px-4 py-2.5 text-sm font-bold text-white"
          >
            Change password
          </button>
        </form>
        <Link to="/account" className="block text-center text-xs font-bold text-[#F5A000]">
          Back to account
        </Link>
      </div>
    </AuthLayout>
  );
}
