import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Logo } from '@/components/Logo';

export const Navbar = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-slate-200/50">
      <Logo />

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <Link href="#features" className="hover:text-brand-600 transition-colors">Features</Link>
        <Link href="#how-it-works" className="hover:text-brand-600 transition-colors">How it Works</Link>
        <Link href="#about" className="hover:text-brand-600 transition-colors">About</Link>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated() ? (
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-brand-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="px-5 py-2.5 text-slate-600 hover:text-brand-600 font-semibold transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-brand-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
