'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { projectsApi, type ProjectStatus } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const statusStyles: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  active: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  archived: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: (status: ProjectStatus) => projectsApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', id] }),
  });

  const { mutate: deleteProject } = useMutation({
    mutationFn: () => projectsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); router.push('/projects'); },
  });

  const isOwner = user?.id === project?.ownerId;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="animate-pulse bg-[var(--surface-2)] h-12 w-2/3 rounded-xl" />
        <div className="animate-pulse bg-[var(--surface-2)] h-48 rounded-[24px]" />
      </div>
    );
  }

  if (!project) return <div className="text-center text-[var(--text-muted)] py-20 bg-[var(--surface-2)] rounded-[24px]">Project not found.</div>;

  return (
    <div className="max-w-4xl pb-12">
      <Link 
        href="/projects" 
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--text-muted)] hover:text-brand-500 transition-colors mb-8"
      >
        <span className="text-lg leading-none mb-0.5">←</span> All Projects
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">{project.title}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border ${statusStyles[project.status]}`}>
              {project.status}
            </span>
          </div>
          {project.owner && (
            <div className="flex items-center gap-2 text-[14px] text-[var(--text-muted)] font-medium">
              <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                {project.owner.fullName.slice(0, 2).toUpperCase()}
              </div>
              {project.owner.fullName}
            </div>
          )}
        </div>
        <div className="flex shrink-0">
          {isOwner && (
            <Link 
              href={`/projects/${id}/workspace`} 
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-[14px] shadow-lg shadow-brand-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              📋 Kanban Board
            </Link>
          )}
        </div>
      </div>

      {/* Abstract */}
      <div className="glass-card p-6 md:p-8 rounded-[24px] mb-6">
        <h2 className="text-[12px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest mb-4">Abstract</h2>
        <p className="text-[16px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap font-medium">
          {project.abstract}
        </p>
      </div>

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="glass-card p-6 md:p-8 rounded-[24px] mb-6">
          <h2 className="text-[12px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span key={t} className="px-3 py-1.5 bg-[var(--surface-2)] text-[var(--text-muted)] rounded-lg text-[13px] font-semibold border border-[var(--border)] uppercase tracking-wide">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Owner actions */}
      {isOwner && (
        <div className="glass-card p-6 md:p-8 rounded-[24px] border border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-transparent">
          <h2 className="text-[12px] font-extrabold text-[var(--text-primary)] uppercase tracking-widest mb-4">Manage Project</h2>
          <div className="flex flex-wrap items-center gap-3">
            {(['draft','active','completed'] as ProjectStatus[]).filter((s) => s !== project.status).map((s) => (
              <button 
                key={s} 
                className="px-5 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-[14px] font-semibold hover:bg-[var(--surface-2)] hover:border-brand-400 transition-colors" 
                onClick={() => updateStatus(s)}
              >
                Mark as {s}
              </button>
            ))}
            <div className="flex-1 min-w-[20px]" />
            <button 
              className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-[14px] font-semibold hover:bg-red-100 transition-colors" 
              onClick={() => { if (confirm('Are you sure you want to archive and completely delete this project?')) deleteProject(); }}
            >
              Archive / Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
