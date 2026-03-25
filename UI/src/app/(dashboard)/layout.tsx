'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [isAuthenticated, router, token]);

  // During SSR and initial hydration both server and client render null → no mismatch
  if (!mounted || !isAuthenticated()) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[var(--bg)] w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 p-5 md:p-10 container mx-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
