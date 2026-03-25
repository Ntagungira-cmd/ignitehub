'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi, type Session, type SessionStatus } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const STATUS_STYLES: Record<SessionStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

function SessionCard({ session }: { session: Session }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isMentor = user?.role === 'mentor';

  const { mutate: confirm, isPending: confirming } = useMutation({
    mutationFn: () => sessionsApi.confirm(session.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });
  const { mutate: cancel, isPending: cancelling } = useMutation({
    mutationFn: () => sessionsApi.cancel(session.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  });

  const d = new Date(session.scheduledAt);
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="glass-card p-5 lg:p-6 rounded-[20px] flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 transition-all hover:shadow-lg hover:-translate-y-0.5 border border-[var(--border)] group">
      <div className="w-14 sm:w-16 shrink-0 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex flex-col items-center py-3 shadow-inner">
        <div className="text-[10px] sm:text-[11px] font-extrabold uppercase text-brand-500 tracking-widest">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] leading-none mt-1.5">{d.getDate()}</div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-[17px] font-bold text-[var(--text-primary)] tracking-tight">
          {timeStr} <span className="text-[var(--text-muted)] font-medium text-sm ml-1">· {session.durationMinutes} min</span>
        </div>
        <div className="text-[14px] font-medium text-[var(--text-muted)] mt-1">
          {isMentor ? `Student: ${session.student?.fullName ?? 'Unknown'}` : `Mentor: ${session.mentor?.fullName ?? 'Unknown'}`}
        </div>
        
        {session.status === 'confirmed' && session.googleCalendarEventUrl && (
          <a 
            href={session.googleCalendarEventUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors bg-brand-50/50 px-3 py-1 rounded-lg border border-brand-100 w-fit"
          >
            <span className="text-sm">📅</span>
            <span>Open in Google Calendar</span>
          </a>
        )}
        
        {session.notes && (
          <div className="mt-3.5 border-l-2 border-brand-500/30 pl-3.5 py-1">
            <p className="text-[13px] text-[var(--text-muted)] italic leading-relaxed">
              &ldquo;{session.notes}&rdquo;
            </p>
          </div>
        )}
        
        {session.project && (
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-2)] rounded-lg border border-[var(--border)]">
            <span className="text-sm">📎</span>
            <span className="text-[12px] font-semibold text-[var(--text-muted)] truncate max-w-[200px]">{session.project.title}</span>
          </div>
        )}
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 mt-4 sm:mt-0 shrink-0">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${STATUS_STYLES[session.status]}`}>
          {session.status}
        </span>
        
        <div className="flex gap-2">
          {isMentor && session.status === 'pending' && (
            <button 
              className="px-3.5 py-1.5 rounded-lg bg-brand-500 text-white text-[13px] font-semibold shadow-sm hover:bg-brand-600 transition-colors disabled:opacity-50" 
              disabled={confirming} 
              onClick={() => confirm()}
            >
              Confirm + Cal
            </button>
          )}
          {session.status !== 'cancelled' && session.status !== 'completed' && (
            <button 
              className="px-3.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-[13px] font-semibold transition-colors disabled:opacity-50" 
              disabled={cancelling} 
              onClick={() => cancel()}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SessionsPage() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: sessionsApi.list,
  });

  const upcoming = sessions?.filter((s) => ['pending','confirmed'].includes(s.status)) ?? [];
  const past = sessions?.filter((s) => ['completed','cancelled'].includes(s.status)) ?? [];

  return (
    <div className="max-w-3xl">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">📅 Sessions</h1>
        <p className="text-[15px] text-[var(--text-muted)]">Manage your upcoming and past mentorship sessions.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1,2,3].map((i) => <div key={i} className="animate-pulse bg-[var(--surface-2)] h-[140px] rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="mb-10">
            <h2 className="flex items-center text-lg font-bold text-[var(--text-primary)] mb-4">
              Upcoming 
              <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-muted)] font-semibold">
                {upcoming.length}
              </span>
            </h2>
            {upcoming.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-[var(--border)] rounded-2xl text-[14px] text-[var(--text-muted)]">
                No upcoming sessions.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {upcoming.map((s) => <SessionCard key={s.id} session={s} />)}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="flex items-center text-lg font-bold text-[var(--text-primary)] mb-4">
                Past 
                <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-muted)] font-semibold">
                  {past.length}
                </span>
              </h2>
              <div className="flex flex-col gap-4 opacity-80 hover:opacity-100 transition-opacity">
                {past.map((s) => <SessionCard key={s.id} session={s} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
