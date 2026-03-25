'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { workspaceApi, type KanbanColumn, type KanbanCard, type CardPriority } from '@/lib/api';

const PRIORITY_COLORS: Record<CardPriority, string> = {
  low: '#22c55e', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444',
};

function CardItem({ card, onMove, columns }: {
  card: KanbanCard;
  onMove: (cardId: string, columnId: string) => void;
  columns: KanbanColumn[];
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl flex overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:border-brand-400 group">
      <div className="w-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" style={{ background: PRIORITY_COLORS[card.priority] }} />
      <div className="flex-1 p-3.5 flex flex-col gap-2.5">
        <div className="text-[14px] font-bold text-[var(--text-primary)] leading-tight group-hover:text-brand-500 transition-colors">
          {card.title}
        </div>
        
        {card.description && (
          <div className="text-[12px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
            {card.description}
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
            {card.priority}
          </span>
          {card.dueDate && (
            <span className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1">
              📅 {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          
          {columns.length > 1 && (
            <select
              className="ml-auto text-[11px] font-medium text-[var(--text-muted)] bg-transparent border-none outline-none cursor-pointer hover:text-[var(--text-primary)] transition-colors focus:ring-0 p-0"
              value={card.columnId}
              onChange={(e) => onMove(card.id, e.target.value)}
            >
              {columns.map((col) => <option key={col.id} value={col.id}>{col.title}</option>)}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

function AddCardForm({ onAdd }: { columnId: string; onAdd: (data: { title: string; description?: string; priority: CardPriority }) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<CardPriority>('medium');

  if (!open) {
    return (
      <button 
        className="w-full py-2.5 rounded-xl border border-dashed border-[var(--border)] text-[13px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-brand-400 hover:bg-brand-500/5 transition-all text-center flex items-center justify-center gap-2" 
        onClick={() => setOpen(true)}
      >
        <span className="text-lg leading-none">+</span> Add card
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 p-3.5 bg-[var(--surface)] border border-brand-500/30 shadow-md shadow-brand-500/5 rounded-xl">
      <input 
        type="text" 
        className="w-full px-3 py-2 bg-[var(--surface-2)] rounded-lg text-[13px] font-medium text-[var(--text-primary)] outline-none border border-transparent focus:border-brand-500 focus:bg-transparent transition-all placeholder:text-[var(--text-muted)]" 
        placeholder="Card title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (title.trim()) { onAdd({ title: title.trim(), description: desc || undefined, priority }); setTitle(''); setDesc(''); setOpen(false); } } }}
        autoFocus 
      />
      <textarea 
        className="w-full px-3 py-2 bg-[var(--surface-2)] rounded-lg text-[12px] text-[var(--text-primary)] outline-none border border-transparent focus:border-brand-500 focus:bg-transparent transition-all min-h-[60px] resize-y placeholder:text-[var(--text-muted)]" 
        placeholder="Description (optional)" 
        value={desc} 
        onChange={(e) => setDesc(e.target.value)} 
      />
      <select 
        className="w-full px-3 py-2 bg-[var(--surface-2)] rounded-lg text-[12px] font-medium text-[var(--text-primary)] outline-none border border-transparent focus:border-brand-500 transition-all cursor-pointer" 
        value={priority} 
        onChange={(e) => setPriority(e.target.value as CardPriority)}
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
        <option value="critical">Critical</option>
      </select>
      <div className="flex gap-2 mt-1">
        <button 
          className="flex-1 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[12px] font-bold shadow-sm transition-colors" 
          onClick={() => { if (title.trim()) { onAdd({ title: title.trim(), description: desc || undefined, priority }); setTitle(''); setDesc(''); setOpen(false); } }}
        >
          Add
        </button>
        <button 
          className="px-3 py-1.5 bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--text-primary)] rounded-lg text-[12px] font-semibold transition-colors" 
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  const { id: projectId } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [newColTitle, setNewColTitle] = useState('');
  const [showAddCol, setShowAddCol] = useState(false);

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace', projectId],
    queryFn: () => workspaceApi.getByProject(projectId),
  });

  const { mutate: addColumn } = useMutation({
    mutationFn: (title: string) =>
      workspaceApi.addColumn(workspace!.id, { title, position: workspace!.columns.length }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workspace', projectId] }); setNewColTitle(''); setShowAddCol(false); },
  });

  const { mutate: addCard } = useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: Parameters<typeof workspaceApi.addCard>[1] }) =>
      workspaceApi.addCard(columnId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace', projectId] }),
  });

  const { mutate: moveCard } = useMutation({
    mutationFn: ({ cardId, columnId }: { cardId: string; columnId: string }) =>
      workspaceApi.updateCard(cardId, { columnId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace', projectId] }),
  });

  if (isLoading) {
    return (
      <div className="flex gap-5 overflow-x-auto pb-6 mt-10">
        {[1,2,3].map((i) => <div key={i} className="animate-pulse w-72 h-[400px] bg-[var(--surface-2)] rounded-[20px] shrink-0" />)}
      </div>
    );
  }

  if (!workspace) return <div className="text-center text-[var(--text-muted)] py-20 bg-[var(--surface-2)] rounded-[24px] mt-10">Workspace not found.</div>;

  const allColumns = workspace.columns ?? [];

  return (
    <div className="flex flex-col h-full pl-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mb-2">📋 {workspace.name}</h1>
          <p className="text-[15px] text-[var(--text-muted)]">Project board for your team.</p>
        </div>
        <button 
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-semibold shadow-sm hover:bg-[var(--surface-2)] hover:border-brand-500 transition-all whitespace-nowrap" 
          onClick={() => setShowAddCol(true)}
        >
          + Add Column
        </button>
      </div>

      {showAddCol && (
        <div className="flex items-center gap-2 mb-6 max-w-sm bg-[var(--surface)] p-2 rounded-xl border border-brand-500/50 shadow-lg shadow-brand-500/5">
          <input 
            type="text" 
            className="flex-1 px-3 py-2 bg-transparent text-[14px] outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)] font-medium" 
            placeholder="Column name" 
            value={newColTitle}
            onChange={(e) => setNewColTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && newColTitle.trim() && addColumn(newColTitle.trim())} 
            autoFocus 
          />
          <button 
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[13px] font-bold shadow-sm transition-colors" 
            onClick={() => newColTitle.trim() && addColumn(newColTitle.trim())}
          >
            Add
          </button>
          <button 
            className="px-3 py-2 text-[var(--text-muted)] hover:text-red-500 rounded-lg transition-colors" 
            onClick={() => { setShowAddCol(false); setNewColTitle(''); }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Board */}
      <div className="flex gap-5 overflow-x-auto pb-8 items-start snap-x flex-1 min-h-0 min-w-0">
        {allColumns
          .sort((a, b) => a.position - b.position)
          .map((col) => (
            <div key={col.id} className="w-[300px] shrink-0 bg-[var(--surface-2)]/60 backdrop-blur-md border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-4 snap-start max-h-full">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <span className="text-[15px] font-extrabold text-[var(--text-primary)] tracking-tight">{col.title}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[11px] font-bold text-[var(--text-muted)] shadow-sm">
                  {col.cards?.length ?? 0}
                </span>
              </div>
              
              <div className="flex flex-col gap-3 min-h-[32px] overflow-y-auto pr-1 pb-1 scrollbar-hide">
                {col.cards?.map((card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    onMove={(cardId, columnId) => moveCard({ cardId, columnId })}
                    columns={allColumns}
                  />
                ))}
              </div>
              
              <div className="mt-auto pt-2">
                <AddCardForm
                  columnId={col.id}
                  onAdd={(data) => addCard({ columnId: col.id, data })}
                />
              </div>
            </div>
          ))}

        {allColumns.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16 text-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border)] rounded-[24px] w-full max-w-2xl mx-auto opacity-70">
            <div className="text-5xl mb-4 filter opacity-60">📋</div>
            <p className="text-[15px]">No columns yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
