'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { projectsApi, matchesApi, sessionsApi, type Project, type Match, type Session } from '@/lib/api';

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  // Tailwind v4 specific dynamic border top handling: we can use style for the dynamic --accent var
  return (
    <div 
      className="glass-card flex flex-col gap-2 p-6 rounded-2xl relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 group" 
      style={{ '--accent': color } as React.CSSProperties}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent)] transition-opacity opacity-80 group-hover:opacity-100" 
      />
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-[var(--text-primary)] leading-none tracking-tight">
        {value}
      </div>
      <div className="text-sm font-medium text-[var(--text-muted)] mt-1">
        {label}
      </div>
    </div>
  );
}

function ProjectItem({ project }: { project: Project }) {
  const statusColors: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-600 border-zinc-200', 
    active: 'bg-green-50 text-green-700 border-green-200', 
    completed: 'bg-blue-50 text-blue-700 border-blue-200', 
    archived: 'bg-zinc-100 text-zinc-600 border-zinc-200'
  };
  
  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className="flex items-center gap-4 py-3.5 transition-opacity hover:opacity-75">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[15px] text-[var(--text-primary)] mb-1 truncate">
            {project.title}
          </div>
          <div className="text-[13px] text-[var(--text-muted)] truncate">
            {project.abstract}
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusColors[project.status] ?? statusColors['draft']}`}>
          {project.status}
        </span>
      </div>
    </Link>
  );
}

function MatchItem({ match }: { match: Match }) {
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200', 
    accepted: 'bg-green-50 text-green-700 border-green-200', 
    rejected: 'bg-red-50 text-red-700 border-red-200'
  };
  const other = match.matchedUser ?? match.student;
  
  return (
    <div className="flex items-center gap-4 py-3.5">
      <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex shrink-0 items-center justify-center font-bold text-sm shadow-sm border border-brand-500/20">
        {other?.fullName?.slice(0, 2).toUpperCase() ?? '??'}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="font-bold text-[15px] text-[var(--text-primary)] truncate">
          {other?.fullName ?? 'Unknown'}
        </div>
        <div className="text-[13px] font-medium text-[var(--text-muted)] capitalize">{match.type}</div>
      </div>
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusColors[match.status] ?? statusColors['pending']}`}>
        {match.status}
      </span>
    </div>
  );
}

function upcomingSession(s: Session) {
  const d = new Date(s.scheduledAt);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isStudent = user?.role === 'student';
  const isMentor = user?.role === 'mentor';

  const { data: myProjects } = useQuery({
    queryKey: ['projects', 'my'],
    queryFn: () => projectsApi.list(),
    enabled: isStudent,
  });

  const { data: myMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: matchesApi.myMatches,
    enabled: isStudent || isMentor,
  });

  const { data: mySessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsApi.list,
    enabled: isStudent || isMentor,
  });

  const pending = myMatches?.filter((m) => m.status === 'pending') ?? [];
  const upcoming = mySessions?.filter((s) => s.status === 'confirmed') ?? [];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">
          Good day, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-[15px] text-[var(--text-muted)]">
          Here&apos;s what&apos;s happening across your workspace.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8 md:mb-10">
        {isStudent && (
          <>
            <StatCard label="My Projects" value={myProjects?.length ?? 0} icon="🚀" color="#6366f1" />
            <StatCard label="Pending Requests" value={pending.length} icon="⏳" color="#f59e0b" />
            <StatCard label="Upcoming Sessions" value={upcoming.length} icon="📅" color="#3b82f6" />
            <StatCard label="Connections" value={myMatches?.filter(m => m.status === 'accepted').length ?? 0} icon="🤝" color="#22c55e" />
          </>
        )}
        {isMentor && (
          <>
            <StatCard label="Incoming Requests" value={pending.length} icon="📨" color="#6366f1" />
            <StatCard label="Active Mentees" value={myMatches?.filter(m => m.status === 'accepted').length ?? 0} icon="🎓" color="#22c55e" />
            <StatCard label="Upcoming Sessions" value={upcoming.length} icon="📅" color="#3b82f6" />
            <StatCard label="Total Sessions" value={mySessions?.length ?? 0} icon="📊" color="#f59e0b" />
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <StatCard label="Manage Users" value="→" icon="🛡️" color="#6366f1" />
            <StatCard label="All Projects" value="→" icon="🚀" color="#3b82f6" />
            <StatCard label="All Resources" value="→" icon="📚" color="#22c55e" />
          </>
        )}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Projects */}
        {isStudent && (
          <div className="glass-card rounded-[20px] p-6 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span className="text-lg font-bold text-[var(--text-primary)]">Recent Projects</span>
              <Link href="/projects/new" className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20">
                + New
              </Link>
            </div>
            <div className="flex flex-col flex-1 divide-y divide-[var(--border)]">
              {myProjects?.length ? (
                myProjects.slice(0, 4).map((p) => <ProjectItem key={p.id} project={p} />)
              ) : (
                <div className="flex-1 flex items-center justify-center py-8">
                  <p className="text-[14px] text-[var(--text-muted)] text-center">
                    No projects yet.{' '}
                    <Link href="/projects/new" className="text-brand-500 font-medium hover:underline">
                      Create one →
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Matches */}
        {(isStudent || isMentor) && (
          <div className="glass-card rounded-[20px] p-6 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span className="text-lg font-bold text-[var(--text-primary)]">{isMentor ? 'Match Requests' : 'My Matches'}</span>
              <Link href="/matches" className="text-sm font-medium text-[var(--text-muted)] hover:text-brand-500 transition-colors">
                View all
              </Link>
            </div>
            <div className="flex flex-col flex-1 divide-y divide-[var(--border)]">
              {myMatches?.length ? (
                myMatches.slice(0, 4).map((m) => <MatchItem key={m.id} match={m} />)
              ) : (
                <div className="flex-1 flex items-center justify-center py-8">
                  <p className="text-[14px] text-[var(--text-muted)] text-center">
                    No matches yet.
                    {isStudent && (
                      <Link href="/matches/recommendations" className="text-brand-500 font-medium hover:underline ml-1">
                        Discover mentors →
                      </Link>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sessions */}
        {(isStudent || isMentor) && upcoming.length > 0 && (
          <div className="glass-card rounded-[20px] p-6 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span className="text-lg font-bold text-[var(--text-primary)]">Upcoming Sessions</span>
              <Link href="/sessions" className="text-sm font-medium text-[var(--text-muted)] hover:text-brand-500 transition-colors">
                View all
              </Link>
            </div>
            <div className="flex flex-col shadow-sm border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]">
              {upcoming.slice(0, 3).map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-4 bg-[var(--surface)] first:rounded-t-xl last:rounded-b-xl">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-lg shrink-0">
                    📅
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] text-[var(--text-primary)] truncate">
                      {upcomingSession(s)}
                    </div>
                    <div className="text-[13px] text-[var(--text-muted)] truncate">
                      {s.durationMinutes} min · {isMentor ? `Student: ${s.student?.fullName}` : `Mentor: ${s.mentor?.fullName}`}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200 capitalize">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions for admin */}
        {user?.role === 'admin' && (
          <div className="glass-card rounded-[20px] p-6 lg:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span className="text-lg font-bold text-[var(--text-primary)]">Quick Links</span>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/admin/users" className="flex items-center gap-3 w-full p-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-left font-medium transition-colors">
                <span className="text-xl">🛡️</span> Manage Users
              </Link>
              <Link href="/resources" className="flex items-center gap-3 w-full p-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-left font-medium transition-colors">
                <span className="text-xl">📚</span> Resources Library
              </Link>
              <Link href="/projects" className="flex items-center gap-3 w-full p-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-left font-medium transition-colors">
                <span className="text-xl">🚀</span> All Projects
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
