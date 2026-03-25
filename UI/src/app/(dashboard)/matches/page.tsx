'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi, type Match } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

function MatchCard({ match, isMentor }: { match: Match; isMentor: boolean }) {
  const qc = useQueryClient();
  const other = isMentor ? match.student : match.matchedUser;

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (status: 'accepted' | 'rejected') => matchesApi.updateStatus(match.id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  });

  return (
    <div className="glass-card p-5 lg:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-start gap-4 transition-all hover:shadow-lg hover:-translate-y-0.5 border border-[var(--border)]">
      <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex shrink-0 items-center justify-center font-bold text-lg shadow-sm">
        {other?.fullName?.slice(0, 2).toUpperCase() ?? '??'}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-base font-bold text-[var(--text-primary)]">
          {other?.fullName ?? 'Unknown'}
        </div>
        <div className="text-[13px] font-medium text-[var(--text-muted)] mt-0.5 capitalize">
          {other?.role} · {match.type} request
        </div>
        
        {match.matchingTags && match.matchingTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {match.matchingTags.slice(0, 5).map((t) => (
              <span key={t} className="px-2 py-0.5 bg-[var(--surface-2)] text-[var(--text-muted)] rounded-md text-[11px] font-semibold border border-[var(--border)] uppercase tracking-wide">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 mt-4 sm:mt-0 shrink-0">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusStyles[match.status] ?? statusStyles['pending']}`}>
          {match.status}
        </span>
        {isMentor && match.status === 'pending' && (
          <div className="flex gap-2">
            <button 
              className="px-3.5 py-1.5 rounded-lg bg-brand-500 text-white text-sm font-semibold shadow-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
              disabled={isPending} 
              onClick={() => updateStatus('accepted')}
            >
              Accept
            </button>
            <button 
              className="px-3.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold transition-colors disabled:opacity-50"
              disabled={isPending} 
              onClick={() => updateStatus('rejected')}
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const { user } = useAuthStore();
  const isMentor = user?.role === 'mentor';

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: matchesApi.myMatches,
  });

  return (
    <div className="max-w-3xl">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">
          {isMentor ? 'Match Requests' : 'My Matches'}
        </h1>
        <p className="text-[15px] text-[var(--text-muted)]">
          {isMentor ? 'Review and respond to student connection requests.' : 'Track your mentorship and collaboration connections.'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1,2,3].map((i) => (
            <div key={i} className="animate-pulse bg-[var(--surface-2)] h-[120px] rounded-2xl" />
          ))}
        </div>
      ) : (matches?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border)] rounded-2xl">
          <div className="text-5xl mb-4">🤝</div>
          <p className="text-[15px] max-w-sm">
            {isMentor ? 'No match requests yet.' : 'No matches yet. Discover mentors to get started.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {matches?.map((m) => <MatchCard key={m.id} match={m} isMentor={!!isMentor} />)}
        </div>
      )}
    </div>
  );
}
