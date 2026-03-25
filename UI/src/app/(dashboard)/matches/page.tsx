'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { matchesApi, sessionsApi, type Match } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

function BookSessionForm({ 
  match, 
  onClose, 
  onSuccess 
}: { 
  match: Match; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const { mutate: book, isPending } = useMutation({
    mutationFn: () => sessionsApi.create({
      mentorId: match.matchedUserId,
      scheduledAt: new Date(`${date}T${time}:00Z`).toISOString(),
      durationMinutes: duration,
      notes,
    }),
    onSuccess: () => {
      onSuccess();
      onClose();
    },
    onError: () => setError('Failed to book session. Please try again.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      setError('Date and time are required.');
      return;
    }
    book();
  };

  return (
    <div className="mt-4 p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] animate-in fade-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-sm text-[var(--text-primary)]">Book Mentorship Session</h4>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Date</label>
          <input 
            type="date" 
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm outline-none focus:border-brand-500 transition-colors"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Time (UTC)</label>
          <input 
            type="time" 
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm outline-none focus:border-brand-500 transition-colors"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Duration (min)</label>
          <select 
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm outline-none focus:border-brand-500 transition-colors"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Notes (optional)</label>
          <textarea 
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm outline-none focus:border-brand-500 transition-colors min-h-[60px] resize-none"
            placeholder="What would you like to discuss?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && <p className="sm:col-span-2 text-red-500 text-xs font-semibold">{error}</p>}

        <div className="sm:col-span-2 flex gap-2 mt-2">
          <button 
            type="submit" 
            className="flex-1 py-2 rounded-lg bg-brand-500 text-white text-sm font-bold shadow-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? 'Booking...' : 'Confirm Booking'}
          </button>
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-bold hover:bg-[var(--surface-2)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function MatchCard({ match, isMentor }: { match: Match; isMentor: boolean }) {
  const [showBooking, setShowBooking] = useState(false);
  const qc = useQueryClient();
  const other = isMentor ? match.student : match.matchedUser;

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (status: 'accepted' | 'rejected') => matchesApi.updateStatus(match.id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  });

  return (
    <div className="glass-card p-5 lg:p-6 rounded-2xl flex flex-col transition-all hover:shadow-lg border border-[var(--border)] animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
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
          
          <div className="flex gap-2">
            {!isMentor && match.status === 'accepted' && !showBooking && (
              <button 
                className="px-3.5 py-1.5 rounded-lg bg-brand-500 text-white text-[13px] font-bold shadow-sm hover:bg-brand-600 transition-colors"
                onClick={() => setShowBooking(true)}
              >
                Book Session
              </button>
            )}
            
            {isMentor && match.status === 'pending' && (
              <>
                <button 
                  className="px-3.5 py-1.5 rounded-lg bg-brand-500 text-white text-[13px] font-bold shadow-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
                  disabled={isPending} 
                  onClick={() => updateStatus('accepted')}
                >
                  Accept
                </button>
                <button 
                  className="px-3.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-[13px] font-bold transition-colors disabled:opacity-50"
                  disabled={isPending} 
                  onClick={() => updateStatus('rejected')}
                >
                  Decline
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showBooking && (
        <BookSessionForm 
          match={match} 
          onClose={() => setShowBooking(false)} 
          onSuccess={() => qc.invalidateQueries({ queryKey: ['sessions'] })}
        />
      )}
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
