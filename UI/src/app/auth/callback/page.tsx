'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuth(user, token);
        router.replace('/dashboard');
      } catch (err) {
        console.error('Failed to parse user from Google callback', err);
        router.replace('/login?error=oauth_failed');
      }
    } else {
      router.replace('/login?error=missing_credentials');
    }
  }, [router, searchParams, setAuth]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[15px] text-[var(--text-muted)] font-medium">Completing sign in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <Suspense fallback={<div>Loading...</div>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
