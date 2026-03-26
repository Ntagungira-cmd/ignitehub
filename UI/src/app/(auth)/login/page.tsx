'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Logo } from '@/components/Logo';

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
        <Logo className="mb-8 relative z-10" />

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

        <div className="relative my-6 z-10 px-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center text-[11px] font-bold uppercase tracking-widest">
            <span className="bg-[var(--bg)] px-3 text-[var(--text-muted)]">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/google`}
          className="w-full py-3 px-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border)] rounded-xl font-semibold transition-all flex items-center justify-center gap-3 active:scale-[0.98] z-10 shadow-sm"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.29 5.38 12 5.38z" fill="#EA4335" />
          </svg>
          Google
        </button>

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
