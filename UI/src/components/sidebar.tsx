'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

const navItems = (role: string) => {
  const base = [
    { href: '/dashboard', icon: '⚡', label: 'Dashboard' },
    { href: '/projects',  icon: '🚀', label: 'Projects' },
    { href: '/resources', icon: '📚', label: 'Resources' },
    { href: '/profile',   icon: '👤', label: 'Profile' },
  ];

  if (role === 'student') {
    base.splice(2, 0,
      { href: '/matches',              icon: '🤝', label: 'Matches' },
      { href: '/matches/recommendations', icon: '✨', label: 'Discover' },
      { href: '/sessions',             icon: '📅', label: 'Sessions' },
    );
  }

  if (role === 'mentor') {
    base.splice(2, 0,
      { href: '/matches',  icon: '🤝', label: 'Matches' },
      { href: '/sessions', icon: '📅', label: 'Sessions' },
    );
  }

  if (role === 'admin') {
    base.push({ href: '/admin/users', icon: '🛡️', label: 'Admin' });
  }

  return base;
};

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const items = navItems(user?.role ?? '');

  return (
    <aside className="w-full md:w-60 min-h-auto md:min-h-screen shrink-0 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] flex flex-col p-4 md:p-5 sticky top-0 border-r md:border-r-[var(--border)] border-b md:border-b-transparent border-[var(--border)] z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-6 md:pb-8">
        <span className="text-2xl">🔥</span>
        <span className="text-lg font-extrabold tracking-tight text-[var(--sidebar-text)]">IgniteHub</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                isActive 
                  ? '!text-brand-600 bg-brand-500/15' 
                  : 'text-[var(--sidebar-text)]/70 hover:text-[var(--sidebar-text)] hover:bg-slate-200/50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User card at bottom */}
      <div className="flex items-center gap-3 p-3 border-t border-[var(--border)] mt-4 md:mt-auto">
        <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex shrink-0 items-center justify-center font-semibold text-xs shadow-sm">
          {user ? initials(user.fullName) : '?'}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-semibold text-[var(--sidebar-text)] whitespace-nowrap overflow-hidden text-ellipsis">
            {user?.fullName}
          </span>
          <span className="text-xs text-[var(--text-muted)] capitalize">
            {user?.role}
          </span>
        </div>
        <button 
          className="p-1.5 rounded-lg text-[var(--sidebar-text)]/60 hover:text-[var(--sidebar-text)] hover:bg-slate-200/50 transition-colors"
          title="Logout" 
          onClick={logout}
        >
          <span>↩</span>
        </button>
      </div>
    </aside>
  );
}
