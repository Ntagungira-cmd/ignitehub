'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi, type UserRole } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const ROLES: { value: UserRole; label: string; desc: string; emoji: string }[] = [
  { value: 'student', label: 'Student', desc: 'Find mentors, build projects', emoji: '🎓' },
  { value: 'mentor',  label: 'Mentor',  desc: 'Guide students, share expertise', emoji: '🧑‍🏫' },
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push('/dashboard');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Registration failed. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutate({ fullName, email, password, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] bg-gradient-to-tl from-transparent via-[var(--surface-2)] to-brand-500/5 p-6 py-12">
      <div className="w-full max-w-[480px] glass-card rounded-[24px] p-8 md:p-10 flex flex-col relative overflow-hidden">
        {/* Decorative ambient glow */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 relative z-10">
          <span className="text-3xl filter drop-shadow-sm">🔥</span>
          <span className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">IgniteHub</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1.5">Create an account</h1>
          <p className="text-[15px] text-[var(--text-muted)] mb-8">Join the community of builders and mentors.</p>
        </div>

        {/* Role picker */}
        <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
          {ROLES.map((r) => {
            const isActive = role === r.value;
            return (
              <button
                key={r.value}
                type="button"
                className={`flex flex-col items-start gap-1 p-4 border-2 rounded-2xl text-left transition-all ${
                  isActive 
                    ? 'border-brand-500 bg-brand-500/5 shadow-[0_0_0_1px_rgba(255,90,0,0.1)]' 
                    : 'border-[var(--border)] bg-[var(--surface)] hover:border-brand-400/50 hover:bg-[var(--surface-2)]'
                }`}
                onClick={() => setRole(r.value)}
              >
                <span className="text-2xl mb-1">{r.emoji}</span>
                <span className="text-[15px] font-semibold text-[var(--text-primary)]">{r.label}</span>
                <span className="text-xs text-[var(--text-muted)] leading-relaxed">{r.desc}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)] ml-0.5" htmlFor="fullName">Full name</label>
            <input 
              id="fullName" 
              type="text" 
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-[var(--text-muted)]" 
              placeholder="Alex Johnson"
              value={fullName} onChange={(e) => setFullName(e.target.value)} required 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)] ml-0.5" htmlFor="email">Email</label>
            <input 
              id="email" 
              type="email" 
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-[var(--text-muted)]" 
              placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)] ml-0.5" htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-[var(--text-muted)] tracking-wider" 
              placeholder="Min. 8 characters"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" 
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-1">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-3 px-4 mt-2 bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={isPending}
          >
            {isPending ? 'Creating account…' : 'Get started'}
          </button>
        </form>

        <p className="text-center mt-8 text-[15px] text-[var(--text-muted)] relative z-10">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-500 font-semibold hover:underline decoration-2 underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
