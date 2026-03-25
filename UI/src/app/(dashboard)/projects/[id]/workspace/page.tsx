'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { workspaceApi, type KanbanColumn, type KanbanCard, type CardPriority } from '@/lib/api';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PRIORITY_COLORS: Record<CardPriority, string> = {
  low: '#22c55e', medium: '#3b82f6', high: '#ef4444', critical: '#991b1b',
};

function SortableCard({ card, onUpdate, onDelete }: {
  card: KanbanCard;
  onUpdate: (data: Partial<KanbanCard>) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [desc, setDesc] = useState(card.description || '');
  const [priority, setPriority] = useState<CardPriority>(card.priority);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isEditing,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleSave = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (title.trim()) {
      onUpdate({ title: title.trim(), description: desc || undefined, priority });
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex flex-col gap-2.5 p-3.5 bg-[var(--surface)] border border-brand-500/30 shadow-md shadow-brand-500/5 rounded-xl"
      >
        <input 
          type="text" 
          className="w-full px-3 py-2 bg-[var(--surface-2)] rounded-lg text-[13px] font-medium text-[var(--text-primary)] outline-none border border-transparent focus:border-brand-500 focus:bg-transparent transition-all" 
          placeholder="Card title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(e); if (e.key === 'Escape') setIsEditing(false); }}
          autoFocus 
        />
        <textarea 
          className="w-full px-3 py-2 bg-[var(--surface-2)] rounded-lg text-[12px] text-[var(--text-primary)] outline-none border border-transparent focus:border-brand-500 focus:bg-transparent transition-all min-h-[60px] resize-y" 
          placeholder="Description" 
          value={desc} 
          onChange={(e) => setDesc(e.target.value)} 
        />
        <div className="flex gap-2">
          <select 
            className="flex-1 px-3 py-1.5 bg-[var(--surface-2)] rounded-lg text-[12px] font-medium text-[var(--text-primary)] outline-none border border-transparent focus:border-brand-500 transition-all cursor-pointer" 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as CardPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button 
            className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-[11px] font-bold transition-colors" 
            onClick={() => { if (confirm('Are you sure?')) { onDelete(); setIsEditing(false); } }}
          >
            Delete
          </button>
        </div>
        <div className="flex gap-2 mt-1">
          <button 
            className="flex-1 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[12px] font-bold shadow-sm transition-colors" 
            onClick={handleSave}
          >
            Save
          </button>
          <button 
            className="px-3 py-1.5 bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--text-primary)] rounded-lg text-[12px] font-semibold transition-colors" 
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-xl flex overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:border-brand-400 group cursor-grab active:cursor-grabbing relative"
    >
      <div className="w-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" style={{ background: PRIORITY_COLORS[card.priority] }} />
      <div className="flex-1 p-3.5 flex flex-col gap-2.5 pr-8">
        <div className="text-[14px] font-bold text-[var(--text-primary)] leading-tight group-hover:text-brand-500 transition-colors">
          {card.title}
        </div>
        
        {card.description && (
          <div className="text-[12px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
            {card.description}
          </div>
        )}
        
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <span 
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-opacity-10 border border-opacity-20"
            style={{ 
              backgroundColor: `${PRIORITY_COLORS[card.priority]}20`,
              color: PRIORITY_COLORS[card.priority],
              borderColor: `${PRIORITY_COLORS[card.priority]}40`,
            }}
          >
            {card.priority}
          </span>
          {card.dueDate && (
            <span className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1">
              📅 {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
      <button 
        onMouseDown={(e) => { e.stopPropagation(); setIsEditing(true); }}
        className="absolute top-2 right-2 p-1.5 text-[var(--text-muted)] hover:text-brand-500 hover:bg-brand-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
      >
        <span className="text-[12px]">✏️</span>
      </button>
    </div>
  );
}

function SortableColumn({ column, cards, onAddCard, onUpdateCard, onDeleteCard }: {
  column: KanbanColumn;
  cards: KanbanCard[];
  onAddCard: (data: { title: string; description?: string; priority: CardPriority }) => void;
  onUpdateCard: (cardId: string, data: Partial<KanbanCard>) => void;
  onDeleteCard: (cardId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-[300px] shrink-0 bg-[var(--surface-2)]/60 backdrop-blur-md border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-4 snap-start max-h-full"
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="flex items-center justify-between pb-3 border-b border-[var(--border)] cursor-grab active:cursor-grabbing"
      >
        <span className="text-[15px] font-extrabold text-[var(--text-primary)] tracking-tight">{column.title}</span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[11px] font-bold text-[var(--text-muted)] shadow-sm">
          {cards.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-3 min-h-[32px] overflow-y-auto pr-1 pb-1 scrollbar-hide">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onUpdate={(data) => onUpdateCard(card.id, data)}
              onDelete={() => onDeleteCard(card.id)}
            />
          ))}
        </SortableContext>
      </div>
      
      <div className="mt-auto pt-2">
        <AddCardForm columnId={column.id} onAdd={onAddCard} />
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { mutate: addColumn } = useMutation({
    mutationFn: (title: string) =>
      workspaceApi.addColumn(workspace!.id, { title, position: workspace!.columns.length }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workspace', projectId] }); setNewColTitle(''); setShowAddCol(false); },
  });

  const { mutate: updateColumn } = useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: any }) =>
      workspaceApi.updateColumn(columnId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace', projectId] }),
  });

  const { mutate: addCard } = useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: Parameters<typeof workspaceApi.addCard>[1] }) =>
      workspaceApi.addCard(columnId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace', projectId] }),
  });

  const { mutate: updateCard } = useMutation({
    mutationFn: ({ cardId, data }: { cardId: string; data: any }) =>
      workspaceApi.updateCard(cardId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace', projectId] }),
  });

  const { mutate: deleteCard } = useMutation({
    mutationFn: (cardId: string) => workspaceApi.deleteCard(cardId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace', projectId] }),
  });

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'Card' && (overType === 'Card' || overType === 'Column')) {
      const activeCard = active.data.current?.card as KanbanCard;
      const overId = over.id as string;
      
      let targetColumnId: string;
      if (overType === 'Column') {
        targetColumnId = overId;
      } else {
        const overCardColumn = workspace!.columns.find(col => 
          col.cards.some(card => card.id === overId)
        );
        targetColumnId = overCardColumn!.id;
      }

      if (activeCard.columnId !== targetColumnId) {
        // Find the columns
        const activeColumn = workspace!.columns.find(col => col.id === activeCard.columnId);
        const overColumn = workspace!.columns.find(col => col.id === targetColumnId);

        if (activeColumn && overColumn) {
          const activeIndex = activeColumn.cards.findIndex(c => c.id === active.id);
          const overIndex = overType === 'Column' 
            ? overColumn.cards.length 
            : overColumn.cards.findIndex(c => c.id === overId);

          const newActiveCards = [...activeColumn.cards];
          newActiveCards.splice(activeIndex, 1);

          const newOverCards = [...overColumn.cards];
          const movedCard = { ...activeCard, columnId: targetColumnId };
          newOverCards.splice(overIndex, 0, movedCard);

          const newColumns = workspace!.columns.map(col => {
            if (col.id === activeColumn.id) return { ...col, cards: newActiveCards };
            if (col.id === overColumn.id) return { ...col, cards: newOverCards };
            return col;
          });

          qc.setQueryData(['workspace', projectId], { ...workspace, columns: newColumns });
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'Column') {
      if (active.id === over.id) return;
      const oldIndex = workspace!.columns.findIndex(c => c.id === active.id);
      const newIndex = workspace!.columns.findIndex(c => c.id === over.id);
      
      const newColumns = arrayMove(workspace!.columns, oldIndex, newIndex);
      
      updateColumn({ 
        columnId: active.id as string, 
        data: { position: newIndex } 
      });
      
      qc.setQueryData(['workspace', projectId], { ...workspace, columns: newColumns });
    }

    if (activeType === 'Card') {
      const activeCard = active.data.current?.card as KanbanCard;
      const overId = over.id as string;
      
      const column = workspace!.columns.find(col => 
        col.cards.some(card => card.id === active.id)
      );
      
      if (!column) return;
      
      const oldIndex = column.cards.findIndex(c => c.id === active.id);
      const newIndex = overType === 'Column' 
        ? column.cards.length - 1
        : column.cards.findIndex(c => c.id === overId);

      if (oldIndex !== newIndex || activeCard.columnId !== column.id) {
        updateCard({
          cardId: activeCard.id,
          data: { columnId: column.id, position: newIndex }
        });
      }
    }
  };

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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 overflow-x-auto pb-8 items-start snap-x flex-1 min-h-0 min-w-0">
          <SortableContext items={allColumns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
            {allColumns.map((col) => (
              <SortableColumn
                key={col.id}
                column={col}
                cards={col.cards || []}
                onAddCard={(data) => addCard({ columnId: col.id, data })}
                onUpdateCard={(cardId, data) => updateCard({ cardId, data })}
                onDeleteCard={(cardId) => deleteCard(cardId)}
              />
            ))}
          </SortableContext>

          {allColumns.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16 text-center text-[var(--text-muted)] border-2 border-dashed border-[var(--border)] rounded-[24px] w-full max-w-2xl mx-auto opacity-70">
              <div className="text-5xl mb-4 filter opacity-60">📋</div>
              <p className="text-[15px]">No columns yet. Add one to get started!</p>
            </div>
          )}
        </div>
      </DndContext>
    </div>
  );
}
