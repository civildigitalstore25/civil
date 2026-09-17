import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AUTH_ROUTES,
  AUTH_SUCCESS_MESSAGE_DURATION_MS,
} from '../../constants/auth';
import type { AuthNavigationState } from '../../types/navigation';

export default function AuthSuccessBanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationState = location.state as AuthNavigationState | null;
  const [message, setMessage] = useState(navigationState?.authMessage ?? '');

  useEffect(() => {
    if (!navigationState?.authMessage) return;

    navigate(AUTH_ROUTES.home, { replace: true, state: null });
  }, [navigate, navigationState?.authMessage]);

  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(
      () => setMessage(''),
      AUTH_SUCCESS_MESSAGE_DURATION_MS,
    );
    return () => window.clearTimeout(timeout);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed right-4 top-36 z-[60] max-w-sm rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg"
    >
      {message}
    </div>
  );
}
