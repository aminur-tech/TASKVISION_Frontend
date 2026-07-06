import { useState } from 'react';
import { Task, useTaskStore } from '@/store/useTaskStore';
import { Trash2, Edit2, Check, X } from 'lucide-react';

export function TaskCard({ task }: { task: Task }) {
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editTags, setEditTags] = useState(task.tags.join(', '));

  const handleDragStart = (e: React.DragEvent) => {
    // Disable dragging if user is interacting with text inputs
    if (isEditing) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', task.id.toString());
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    await updateTask(task.id, {
      title: editTitle,
      priority: editPriority,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
    });
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset values back to original properties on cancel
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditTags(task.tags.join(', '));
    setIsEditing(false);
  };

  const priorityColors = {
    HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      className={`group relative rounded-xl border bg-slate-900 p-4 shadow-md transition-all ${
        isEditing 
          ? 'border-indigo-500/50 bg-slate-900 ring-1 ring-indigo-500/20' 
          : 'cursor-grab active:cursor-grabbing border-white/[0.06] hover:border-white/20 hover:bg-slate-850'
      }`}
    >
      {isEditing ? (
        /* --- EDIT MODE LAYOUT --- */
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-medium text-slate-500 mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                className="w-full rounded-lg border border-white/[0.08] bg-slate-950 px-2 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Tags</label>
              <input
                type="text"
                value={editTags}
                placeholder="bug, feature"
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-slate-950 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-1.5 pt-1">
            <button
              onClick={handleCancel}
              className="flex items-center justify-center rounded-lg border border-white/[0.08] p-1.5 text-slate-400 hover:bg-white/[0.02]"
              title="Cancel Changes"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center rounded-lg bg-indigo-600 p-1.5 text-white hover:bg-indigo-500"
              title="Save Changes"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* --- READ ONLY DISPLAY MODE --- */
        <>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-slate-200 text-sm leading-snug">{task.title}</h4>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-500 hover:text-indigo-400 p-1 transition-colors"
                title="Edit Task"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                title="Delete Task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {task.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-white/[0.04] border border-white/[0.04] px-2 py-0.5 text-xs text-slate-400">
                #{tag}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}