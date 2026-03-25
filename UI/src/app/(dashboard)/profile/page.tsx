'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function ProfilePage() {
  const qc = useQueryClient();
  const { user: authUser, updateUser } = useAuthStore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
  });

  const [fullName, setFullName] = useState(authUser?.fullName ?? '');
  const [bio, setBio] = useState(authUser?.bio ?? '');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(authUser?.skills ?? []);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: () => setError('Failed to save. Please try again.'),
  });

  const addSkill = () => {
    const s = skillInput.trim().toLowerCase();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput('');
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutate({ fullName, bio, skills });
  };

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 max-w-2xl">
        <div className="animate-pulse h-24 bg-[var(--surface-2)] rounded-3xl" />
        <div className="animate-pulse h-[400px] bg-[var(--surface-2)] rounded-3xl" />
      </div>
    );
  }

  const u = profile ?? authUser;

  return (
    <div className="max-w-2xl pb-12">
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">Profile</h1>
        <p className="text-[15px] text-[var(--text-muted)]">Update your personal information and skills.</p>
      </div>

      {/* Avatar & info */}
      <div className="glass-card p-6 md:p-8 rounded-[24px] flex items-center gap-6 mb-6">
        <div className="w-20 h-20 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-brand-500/20 shrink-0">
          {u ? initials(u.fullName) : '?'}
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{u?.fullName}</div>
          <div className="text-[14px] font-semibold text-[var(--text-muted)] capitalize">{u?.role}</div>
          <div className="text-[13px] text-[var(--text-muted)]">{u?.email}</div>
        </div>
      </div>

      {/* Edit form */}
      <div className="glass-card p-6 md:p-8 rounded-[24px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="fullName">Full name</label>
            <input 
              id="fullName" 
              type="text" 
              className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:bg-[var(--surface)] focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-[var(--text-muted)]" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)} 
              required 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]" htmlFor="bio">Bio</label>
            <textarea 
              id="bio" 
              className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:bg-[var(--surface)] focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-[var(--text-muted)] min-h-[120px] resize-y" 
              placeholder="Tell others about yourself…"
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]">
              Skills <span className="text-[13px] text-[var(--text-muted)] font-medium ml-1">(used for mentor matching)</span>
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[15px] outline-none transition-all focus:bg-[var(--surface)] focus:border-brand-500 placeholder:text-[var(--text-muted)]" 
                placeholder="e.g. python" 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(); } }} 
              />
              <button 
                type="button" 
                className="px-6 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] font-semibold hover:bg-[var(--surface)] hover:border-brand-400 transition-colors" 
                onClick={addSkill}
              >
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((s) => (
                  <span 
                    key={s} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 text-brand-700 border border-brand-500/20 rounded-lg text-[13px] font-semibold cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors group"
                    onClick={() => removeSkill(s)}
                  >
                    {s} <span className="opacity-50 group-hover:opacity-100 text-[10px]">✕</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="min-h-[24px] mt-2 mb-2">
            {error && <p className="text-red-600 text-[14px] font-medium">{error}</p>}
            {saved && <p className="text-green-600 text-[14px] font-medium flex items-center gap-1.5">✓ Changes saved successfully</p>}
          </div>

          <button 
            type="submit" 
            className="w-full sm:w-auto self-start px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-[15px] shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={isPending}
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
