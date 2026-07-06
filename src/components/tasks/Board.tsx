'use html';
'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Column } from '@/components/tasks/Column';
import { Plus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { DateSelector } from './DateSelector';

export default function TaskBoard() {
  const { tasks, fetchTasks, selectedDate, addTask } = useTaskStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newTags, setNewTags] = useState('');

  // Status management states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await addTask({
        title: newTitle,
        status: 'TODO',
        priority: newPriority,
        due_date: selectedDate,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      });

      // Show temporary inline Success State
      setStatusMessage({ type: 'success', text: 'Task created successfully!' });
      setNewTitle('');
      setNewTags('');
      
      // Gracefully close modal after a brief window so user sees the success
      setTimeout(() => {
        setModalOpen(false);
        setStatusMessage(null);
      }, 1200);

    } catch (error) {
      let errorMessage = 'Server connection failed. Verify database migrations.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Catch backend exceptions (e.g. database column operational errors or 500 crashes)
      setStatusMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset status states when closing the modal manually
  const handleCloseModal = () => {
    setModalOpen(false);
    setStatusMessage(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mx-auto max-w-7xl">
        
        {/* Management Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Workspace Boards</h1>
            <p className="text-sm text-slate-400 mt-1">Organize operational tasks dynamically.</p>
          </div>
          <div className="flex items-center gap-3">
            <DateSelector />
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/20"
            >
              <Plus className="h-4 w-4" /> Create Task
            </button>
          </div>
        </div>

        {/* Board Framework Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Column title="To Do" status="TODO" tasks={tasks.filter(t => t.status === 'TODO')} />
          <Column title="In Progress" status="IN_PROGRESS" tasks={tasks.filter(t => t.status === 'IN_PROGRESS')} />
          <Column title="Done" status="DONE" tasks={tasks.filter(t => t.status === 'DONE')} />
        </div>
      </div>

      {/* Dynamic Task Creation Modal Component */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-slate-900 p-6 shadow-2xl transition-all">
            <h2 className="text-lg font-semibold text-white mb-4">Add Task for {selectedDate}</h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              
              {/* Feedback Message Alert Block */}
              {statusMessage && (
                <div className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-sm transition-all ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Task Title</label>
                <input
                  type="text" required disabled={isSubmitting} value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                <select
                  disabled={isSubmitting} value={newPriority} onChange={(e) => setNewPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text" disabled={isSubmitting} value={newTags} placeholder="frontend, feature, bug" onChange={(e) => setNewTags(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button" disabled={isSubmitting} onClick={handleCloseModal}
                  className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.02] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}