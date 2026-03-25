'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { matchesApi, projectsApi, type MatchRecommendation, type Project } from '@/lib/api';

function RecommendationCard({ rec, projects }: { rec: MatchRecommendation, projects: Project[] }) {
  const [matchType, setMatchType] = useState<'mentor' | 'collaborator'>('mentor');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const qc = useQueryClient();
  const { mentor, score, matchingTags } = rec;
  const scorePercent = Math.round(score * 100);

  const { mutate: sendRequest, isPending, isSuccess } = useMutation({
    mutationFn: () => matchesApi.request(mentor.id, { 
      type: matchType,
      projectId: selectedProjectId || undefined,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recommendations'] }),
  });

  return (
    <div className="glass-card rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border border-[var(--border)]">
      <div className="h-1.5 w-full bg-[var(--surface-2)]">
        <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-r-md" style={{ width: `${scorePercent}%` }} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 p-5 lg:p-6">
        <div className="w-16 h-16 rounded-full bg-brand-500 text-white flex shrink-0 items-center justify-center font-bold text-xl shadow-md border-2 border-[var(--bg)]">
          {mentor.fullName?.slice(0, 2).toUpperCase() ?? 'MN'}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-extrabold text-[var(--text-primary)] tracking-tight">
            {mentor.fullName}
          </div>
          <div className="text-[13px] font-medium text-[var(--text-muted)] mt-0.5">
            {mentor.email}
          </div>
          
          {mentor.bio && (
             <p className="text-[14px] text-[var(--text-muted)] mt-3 leading-relaxed line-clamp-2">
               {mentor.bio}
             </p>
          )}

          {mentor.skills && mentor.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {mentor.skills.slice(0, 6).map((s) => {
                const isMatched = matchingTags.includes(s);
                return (
                  <span 
                    key={s} 
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors ${
                      isMatched 
                        ? 'bg-brand-500/10 text-brand-600 border-brand-400' 
                        : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'
                    }`}
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">
              ✨ {scorePercent}% match
            </span>
            {matchingTags.length > 0 && (
              <span className="text-[12px] font-medium text-[var(--text-muted)]">
                {matchingTags.length} shared skill{matchingTags.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <div className="flex bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)]">
              <button 
                onClick={() => setMatchType('mentor')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${matchType === 'mentor' ? 'bg-brand-500 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              >
                MENTOR
              </button>
              <button 
                onClick={() => setMatchType('collaborator')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all ${matchType === 'collaborator' ? 'bg-brand-500 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
              >
                COLLABORATOR
              </button>
            </div>

            {projects.length > 0 && (
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-[12px] font-semibold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
                <option value="">General (No Project)</option>
              </select>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-0 shrink-0 flex flex-row sm:flex-col justify-end">
          {isSuccess ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-green-50 text-green-700 border border-green-200">
              Request sent ✓
            </span>
          ) : (
            <button 
              className="px-5 py-2 rounded-xl bg-brand-500 text-white text-[14px] font-semibold shadow-sm shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95 disabled:opacity-50" 
              disabled={isPending} 
              onClick={() => sendRequest()}
            >
              {isPending ? 'Sending…' : 'Connect'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: matchesApi.recommendations,
  });

  const { data: projects } = useQuery({
    queryKey: ['my-projects'],
    queryFn: () => projectsApi.list({ limit: 100 }),
  });

  return (
    <div className="max-w-4xl">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">✨ Discover Mentors</h1>
        <p className="text-[15px] text-[var(--text-muted)]">
          Mentors are ranked by skill overlap with your projects (Jaccard similarity). Connect with the best match!
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-[var(--surface-2)] h-[180px] rounded-[20px]" />
          ))}
        </div>
      ) : (recommendations?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border)] rounded-[24px]">
          <div className="text-5xl mb-4 opacity-80 filter drop-shadow-sm">🔍</div>
          <p className="text-[15px] max-w-sm">No recommendations yet. Add skills and tags to your projects to improve matching.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {(recommendations ?? []).map((r) => (
            <RecommendationCard key={r.mentor.id} rec={r} projects={projects ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}
