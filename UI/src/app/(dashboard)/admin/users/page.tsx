'use client';

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';

function roleColor(role: string) {
  if (role === 'admin') return 'bg-red-50 text-red-700 border-red-200';
  if (role === 'mentor') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-zinc-100 text-zinc-600 border-zinc-200';
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function AdminUsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => usersApi.list(),
  });

  return (
    <div className="max-w-7xl">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">🛡️ User Management</h1>
        <p className="text-[15px] text-[var(--text-muted)]">All registered users on IgniteHub.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3,4,5].map((i) => <div key={i} className="animate-pulse bg-[var(--surface-2)] h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="glass-card rounded-[20px] overflow-hidden border border-[var(--border)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse whitespace-nowrap">
              <thead>
                <tr>
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--surface-2)] border-b border-[var(--border)]">User</th>
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--surface-2)] border-b border-[var(--border)]">Email</th>
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--surface-2)] border-b border-[var(--border)]">Role</th>
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--surface-2)] border-b border-[var(--border)]">Skills</th>
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--surface-2)] border-b border-[var(--border)]">Status</th>
                  <th className="px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] bg-[var(--surface-2)] border-b border-[var(--border)]">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users?.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex shrink-0 items-center justify-center font-bold text-[11px] shadow-sm">
                          {initials(u.fullName)}
                        </div>
                        <span className="font-semibold text-[14px] text-[var(--text-primary)]">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-[14px] text-[var(--text-muted)]">{u.email}</td>
                    <td className="px-5 py-4 align-middle">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${roleColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle text-[13px] text-[var(--text-muted)]">
                      {u.skills && u.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {u.skills.slice(0, 3).map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-[var(--surface-2)] rounded text-[11px] font-medium border border-[var(--border)] truncate max-w-[100px]">{s}</span>
                          ))}
                          {u.skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-[var(--surface-2)] rounded text-[11px] font-medium border border-[var(--border)]">+{u.skills.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="opacity-50">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${u.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle text-[13px] text-[var(--text-muted)]">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {(users?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-[var(--text-muted)] py-12 text-[14px]">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
