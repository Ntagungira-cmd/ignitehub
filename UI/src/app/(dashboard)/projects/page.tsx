'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { projectsApi, type Project, type ProjectStatus } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const STATUS_FILTERS: { label: string; value: ProjectStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Completed', value: 'completed' },
];

const statusStyles: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  archived: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="block h-full group">
      <div className="glass-card p-5 lg:p-6 rounded-[20px] flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-500/30">
        <div className="flex items-start justify-between mb-3 gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${statusStyles[project.status]}`}>
            {project.status}
          </span>
          <span className="text-[11px] font-medium text-[var(--text-muted)] shrink-0 mt-1">
            {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-[var(--text-primary)] leading-snug mb-2 group-hover:text-brand-500 transition-colors line-clamp-2">
          {project.title}
        </h3>
        
        <p className="text-[13px] text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-4">
          {project.abstract}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
          {project.tags?.slice(0, 3).map((t) => (
            <span key={t} className="px-2 py-0.5 bg-[var(--surface-2)] text-[var(--text-muted)] rounded pl-1.5 text-[11px] font-medium border border-[var(--border)] truncate max-w-[100px]">
              <span className="text-[10px] text-brand-500 mr-1 opacity-70">#</span>{t}
            </span>
          ))}
          {(project.tags?.length ?? 0) > 3 && (
            <span className="px-2 py-0.5 bg-[var(--surface-2)] text-[var(--text-muted)] rounded text-[11px] font-medium border border-[var(--border)]">
              +{(project.tags?.length ?? 0) - 3}
            </span>
          )}
        </div>
        
        {project.owner && (
          <div className="flex items-center gap-2.5 pt-4 border-t border-[var(--border)]">
            <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-[9px] font-bold">
              {project.owner.fullName.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[12px] font-semibold text-[var(--text-muted)] truncate">
              {project.owner.fullName}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | ''>('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', status],
    queryFn: () => projectsApi.list(status ? { status } : undefined),
  });

  const filtered = projects?.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  ) ?? [];

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Projects</h1>
          <p className="text-[15px] text-[var(--text-muted)]">Browse student projects and find collaboration opportunities.</p>
        </div>
        {user?.role === 'student' && (
          <Link href="/projects/new" className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold shadow-sm hover:bg-brand-600 transition-colors whitespace-nowrap">
            + New Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8 bg-[var(--surface)] p-2 rounded-2xl border border-[var(--border)]">
        <div className="w-full md:max-w-xs relative shrink-0">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-transparent rounded-xl text-[14px] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            placeholder="Search projects or tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg opacity-50">🔍</span>
        </div>
        
        <div className="w-px h-8 bg-[var(--border)] hidden md:block" />
        
        <div className="flex flex-wrap gap-1.5 px-2 md:px-0 pb-2 md:pb-0">
          {STATUS_FILTERS.map((f) => {
            const isActive = status === f.value;
            return (
              <button
                key={f.value}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                  isActive 
                    ? 'bg-[var(--text-primary)] text-[var(--bg)] shadow-md' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
                }`}
                onClick={() => setStatus(f.value)}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div key={i} className="animate-pulse bg-[var(--surface-2)] h-[240px] rounded-[20px]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border)] rounded-2xl">
          <div className="text-5xl mb-4">🚀</div>
          <p className="text-[15px]">No projects found matching your criteria.</p>
          {user?.role === 'student' && !search && !status && (
            <Link href="/projects/new" className="inline-flex mt-4 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
              Create the first one
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
