'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { resourcesApi, type ResourceCategory } from '@/lib/api';

const CATEGORIES: { value: ResourceCategory; label: string }[] = [
  { value: 'template', label: 'Template' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'article', label: 'Article' },
  { value: 'invention', label: 'Invention' },
];

export default function NewResourcePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('template');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: (fd: FormData) => resourcesApi.create(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      router.push('/resources');
    },
    onError: () => setError('Upload failed. Please try again.'),
  });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('category', category);
    tags.forEach((t) => fd.append('tags[]', t));
    if (file) fd.append('file', file);
    mutate(fd);
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--text-muted)] hover:text-brand-500 transition-colors mb-6"
      >
        <span className="text-lg leading-none mb-0.5">←</span> Back to Resources
      </button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Upload a Resource</h1>
        <p className="text-[15px] text-[var(--text-muted)]">Share knowledge with the IgniteHub community.</p>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-[24px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CATEGORIES.map((c) => {
                const isActive = category === c.value;
                return (
                  <button 
                    key={c.value} 
                    type="button"
                    className={`px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all border ${
                      isActive 
                        ? 'bg-brand-500/10 text-brand-600 border-brand-400 shadow-[0_0_0_1px_rgba(255,90,0,0.1)]' 
                        : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-transparent hover:border-[var(--border)] hover:text-[var(--text-primary)]'
                    }`}
                    onClick={() => setCategory(c.value)}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="res-title">Title <span className="text-brand-500">*</span></label>
            <input 
              id="res-title" 
              type="text" 
              className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:bg-[var(--surface)] focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-[var(--text-muted)]" 
              placeholder="Resource title"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="res-desc">Description</label>
            <textarea 
              id="res-desc" 
              className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:bg-[var(--surface)] focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-[var(--text-muted)] min-h-[100px] resize-y" 
              rows={4} 
              placeholder="Describe what this resource contains…"
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Tags</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:bg-[var(--surface)] focus:border-brand-500 placeholder:text-[var(--text-muted)]" 
                placeholder="e.g. react" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }} 
              />
              <button 
                type="button" 
                className="px-5 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] font-semibold hover:bg-[var(--surface)] hover:border-brand-400 transition-colors" 
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
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                  >
                    {t} <span className="opacity-50 group-hover:opacity-100 text-[10px]">✕</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]">
              File <span className="text-[var(--text-muted)] font-medium text-[12px] ml-1">(optional, max 50 MB)</span>
            </label>
            <div 
              className="border-2 border-dashed border-[var(--border)] hover:border-brand-500 bg-[var(--surface-2)]/50 hover:bg-brand-500/5 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[140px]" 
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center text-xl">
                    📎
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px] text-[var(--text-primary)]">{file.name}</span>
                    <button 
                      type="button" 
                      className="p-1.5 rounded-md hover:bg-red-100 text-red-500 transition-colors" 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[var(--surface)] text-[var(--text-muted)] shadow-sm border border-[var(--border)] flex items-center justify-center text-xl">
                    ☁️
                  </div>
                  <span className="text-[14px] font-medium text-[var(--text-muted)]">
                    Click to select a file or <span className="text-brand-500">drag and drop here</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {error && <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[14px] font-medium">{error}</div>}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--border)] mt-2">
            <button 
              type="submit" 
              className="flex-1 py-3.5 px-6 bg-brand-500 hover:bg-brand-600 outline-none text-white rounded-xl font-bold text-[15px] shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
              disabled={isPending}
            >
              {isPending ? 'Uploading…' : <span><span className="text-lg leading-none">⬆</span> Upload Resource</span>}
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
