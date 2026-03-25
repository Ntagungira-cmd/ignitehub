'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { projectsApi } from '@/lib/api';

export default function NewProjectPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      router.push(`/projects/${project.id}`);
    },
    onError: () => setError('Failed to create the project. Please try again.'),
  });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutate({ title, abstract, tags });
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--text-muted)] hover:text-brand-500 transition-colors mb-6"
      >
        <span className="text-lg leading-none mb-0.5">←</span> Back to projects
      </button>

      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Create a new project</h1>
        <p className="text-[15px] text-[var(--text-muted)]">Describe your project so mentors and collaborators can discover it.</p>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-[24px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="title">Project title <span className="text-brand-500">*</span></label>
            <input 
              id="title" 
              type="text" 
              className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:bg-[var(--surface)] focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-[var(--text-muted)]" 
              placeholder="e.g. AI-Powered Study Assistant"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              maxLength={100} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="abstract">Abstract <span className="text-brand-500">*</span></label>
            <textarea 
              id="abstract" 
              className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:bg-[var(--surface)] focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-[var(--text-muted)] min-h-[140px] resize-y" 
              placeholder="Describe your project, its goals, and the problem it solves…"
              value={abstract} 
              onChange={(e) => setAbstract(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]">
              Tags <span className="text-[13px] text-[var(--text-muted)] font-medium ml-1">(press Enter to add)</span>
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:bg-[var(--surface)] focus:border-brand-500 placeholder:text-[var(--text-muted)]" 
                placeholder="e.g. machine-learning"
                value={tagInput} 
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown} 
              />
              <button 
                type="button" 
                className="px-6 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] font-semibold hover:bg-[var(--surface)] hover:border-brand-400 transition-colors" 
                onClick={addTag}
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t) => (
                  <span 
                    key={t} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 text-brand-700 border border-brand-500/20 rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors group"
                    onClick={() => removeTag(t)}
                  >
                    {t} <span className="opacity-50 group-hover:opacity-100 text-[10px]">✕</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[14px] font-medium mt-2">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--border)] mt-2">
            <button 
              type="submit" 
              className="flex-1 py-3.5 px-6 bg-brand-500 hover:bg-brand-600 outline-none text-white rounded-xl font-bold text-[15px] shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
              disabled={isPending}
            >
              <span className="text-xl leading-none -mt-0.5">🚀</span> {isPending ? 'Creating…' : 'Create Project'}
            </button>
            <button 
              type="button" 
              className="py-3.5 px-8 bg-[var(--surface-2)] hover:bg-slate-200 text-[var(--text-primary)] rounded-xl font-bold text-[15px] transition-colors" 
              onClick={() => router.back()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
