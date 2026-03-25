'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push('/dashboard');
    },
    onError: () => setError('Invalid email or password. Please try again.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] bg-gradient-to-br from-transparent via-[var(--surface-2)] to-brand-500/5 p-6">
      <div className="w-full max-w-[420px] glass-card rounded-[24px] p-8 md:p-10 flex flex-col relative overflow-hidden">
        {/* Decorative ambient glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 relative z-10">
          <span className="text-3xl filter drop-shadow-sm">🔥</span>
          <span className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">IgniteHub</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1.5">Welcome back</h1>
          <p className="text-[15px] text-[var(--text-muted)] mb-8">Sign in to continue to your workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)] ml-0.5" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-[var(--text-muted)]"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)] ml-0.5" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-[var(--text-muted)] tracking-wider"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3 px-4 mt-2 bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={isPending}
          >
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center mt-8 text-[15px] text-[var(--text-muted)] relative z-10">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-500 font-semibold hover:underline decoration-2 underline-offset-4">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
