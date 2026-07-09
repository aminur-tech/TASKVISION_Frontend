'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Column } from '@/components/tasks/Column';
import { Plus, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { DateSelector } from './DateSelector';

export default function TaskBoard() {
  const { tasks, fetchTasks, selectedDate, addTask } = useTaskStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newTags, setNewTags] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

      setStatusMessage({ type: 'success', text: 'Task created successfully!' });
      setNewTitle('');
      setNewTags('');
      
      setTimeout(() => {
        setModalOpen(false);
        setStatusMessage(null);
      }, 1200);

    } catch (error) {
      let errorMessage = 'Server connection failed. Verify database migrations.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setStatusMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setModalOpen(false);
    setStatusMessage(null);
  };

  return (
    <main className="min-h-screen bg-slate-950 pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-12 overflow-x-hidden">
      <div className="mx-auto max-w-7xl">
        
        {/* Management Controls Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Workspace Boards</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Organize operational tasks dynamically.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial">
              <DateSelector />
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all px-4 py-3 sm:py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/10 active:shadow-none select-none touch-manipulation"
            >
              <Plus className="h-4 w-4 shrink-0" /> <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Board Grid Framework: Columns scroll inline on mobile screens instead of breaking */}
        <div className="flex lg:grid lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto pb-4 lg:pb-0 snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 scrollbar-none">
          <div className="w-[85vw] sm:w-[45vw] md:w-[320px] lg:w-auto shrink-0 snap-center">
            <Column title="To Do" status="TODO" tasks={tasks.filter(t => t.status === 'TODO')} />
          </div>
          <div className="w-[85vw] sm:w-[45vw] md:w-[320px] lg:w-auto shrink-0 snap-center">
            <Column title="In Progress" status="IN_PROGRESS" tasks={tasks.filter(t => t.status === 'IN_PROGRESS')} />
          </div>
          <div className="w-[85vw] sm:w-[45vw] md:w-[320px] lg:w-auto shrink-0 snap-center">
            <Column title="Done" status="DONE" tasks={tasks.filter(t => t.status === 'DONE')} />
          </div>
        </div>
      </div>

      {/* Touch-Friendly Screen Modal Overlay Container */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          {/* Modal Card Element */}
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/[0.08] bg-slate-900 p-5 sm:p-6 shadow-2xl transition-all max-h-[92vh] overflow-y-auto flex flex-col pb-8 sm:pb-6">
            
            {/* Modal Drag/Indicator Handle for Mobile Context */}
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-4 shrink-0 sm:hidden" onClick={handleCloseModal} />

            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-base sm:text-lg font-semibold text-white">Add Task for {selectedDate}</h2>
              <button 
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all disabled:opacity-30 touch-manipulation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="space-y-4 flex-1">
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
                  <span className="leading-tight">{statusMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Task Title</label>
                <input
                  type="text" required disabled={isSubmitting} value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 appearance-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Priority</label>
                <div className="relative">
                  <select
                    disabled={isSubmitting} value={newPriority} onChange={(e) => setNewPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                    className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 appearance-none cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Tags (comma separated)</label>
                <input
                  type="text" disabled={isSubmitting} value={newTags} placeholder="frontend, feature, bug" onChange={(e) => setNewTags(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 appearance-none placeholder-slate-600"
                />
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 sm:pt-2 mt-auto sm:mt-0">
                <button
                  type="button" disabled={isSubmitting} onClick={handleCloseModal}
                  className="w-full sm:w-auto rounded-xl border border-white/[0.08] px-4 py-3 sm:py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.02] active:bg-white/[0.05] disabled:opacity-50 select-none touch-manipulation"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 sm:py-2 text-sm font-medium text-white hover:bg-indigo-500 active:scale-[0.98] disabled:bg-indigo-600/50 disabled:cursor-not-allowed select-none touch-manipulation transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Task</span>
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