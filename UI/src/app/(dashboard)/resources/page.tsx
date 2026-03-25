'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { resourcesApi, type Resource, type ResourceCategory } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const CATEGORIES: { label: string; value: ResourceCategory | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Templates', value: 'template' },
  { label: 'Workshops', value: 'workshop' },
  { label: 'Articles', value: 'article' },
  { label: 'Inventions', value: 'invention' },
];

const CAT_ICONS: Record<string, string> = {
  template: '📄', workshop: '🛠️', article: '📰', invention: '💡',
};

const CAT_STYLES: Record<string, string> = {
  template: 'bg-blue-50 text-blue-700 border-blue-200',
  workshop: 'bg-orange-50 text-orange-700 border-orange-200',
  article: 'bg-stone-50 text-stone-700 border-stone-200',
  invention: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

function ResourceCard({ resource, canDelete }: { resource: Resource; canDelete: boolean }) {
  const qc = useQueryClient();
  const { mutate: del } = useMutation({
    mutationFn: () => resourcesApi.remove(resource.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] }),
  });

  return (
    <div className="glass-card p-5 lg:p-6 rounded-[20px] flex flex-col sm:flex-row gap-4 sm:gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-500/30 group h-full">
      <div className="text-4xl sm:text-5xl shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform origin-center">
        {CAT_ICONS[resource.category] ?? '📁'}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3 gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${CAT_STYLES[resource.category]}`}>
            {resource.category}
          </span>
          {canDelete && (
            <button 
              className="p-1.5 rounded-lg text-red-500/60 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto -mr-2" 
              title="Delete" 
              onClick={() => { if (confirm('Delete this resource?')) del(); }}
            >
              🗑
            </button>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-[var(--text-primary)] leading-snug mb-2 group-hover:text-brand-500 transition-colors">
          {resource.title}
        </h3>
        
        {resource.description && (
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-4">
            {resource.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
          {resource.tags?.slice(0, 4).map((t) => (
            <span key={t} className="px-2 py-0.5 bg-[var(--surface-2)] text-[var(--text-muted)] rounded text-[11px] font-medium border border-[var(--border)] truncate max-w-[120px]">
              {t}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border)]">
          {resource.author && (
             <span className="text-[12px] font-semibold text-[var(--text-muted)] truncate max-w-[150px]">
               by {resource.author.fullName}
             </span>
          )}
          {resource.fileUrl && (
            <a 
              href={resource.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[12px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface)] hover:text-brand-500 transition-colors shadow-sm"
            >
              <span className="text-lg leading-none mb-0.5">⬇</span> Download
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const { user } = useAuthStore();
  const canUpload = user?.role === 'mentor' || user?.role === 'admin';
  const [category, setCategory] = useState<ResourceCategory | ''>('');
  const [search, setSearch] = useState('');

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources', category],
    queryFn: () => resourcesApi.list(category ? { category } : undefined),
  });

  const filtered = resources?.filter((r) =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  ) ?? [];

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">📚 Resources</h1>
          <p className="text-[15px] text-[var(--text-muted)]">Browse templates, workshops, articles, and inventions shared by the community.</p>
        </div>
        {canUpload && (
          <Link href="/resources/new" className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold shadow-sm hover:bg-brand-600 transition-colors whitespace-nowrap">
            + Upload
          </Link>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8 bg-[var(--surface)] p-2 rounded-2xl border border-[var(--border)]">
        <div className="w-full md:max-w-xs relative shrink-0">
          <input 
            type="text" 
            className="w-full pl-10 pr-4 py-2 bg-transparent rounded-xl text-[14px] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" 
            placeholder="Search resources…" 
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg opacity-50">🔍</span>
        </div>
        
        <div className="w-px h-8 bg-[var(--border)] hidden md:block" />
        
        <div className="flex flex-wrap gap-1.5 px-2 md:px-0 pb-2 md:pb-0">
          {CATEGORIES.map((c) => {
             const isActive = category === c.value;
             return (
              <button 
                key={c.value} 
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                  isActive 
                    ? 'bg-[var(--text-primary)] text-[var(--bg)] shadow-md' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
                }`}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="animate-pulse bg-[var(--surface-2)] h-[240px] rounded-[20px]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border)] rounded-2xl">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-[15px]">No resources found.</p>
          {canUpload && (
            <Link href="/resources/new" className="inline-flex mt-4 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
              Upload one →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
          {filtered.map((r) => (
            <ResourceCard key={r.id} resource={r} canDelete={user?.id === r.authorId || user?.role === 'admin'} />
          ))}
        </div>
      )}
    </div>
  );
}
