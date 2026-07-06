
import { Task, useTaskStore } from '@/store/useTaskStore';
import { TaskCard } from './TaskCard';


interface ColumnProps {
  title: string;
  status: Task['status'];
  tasks: Task[];
}

export function Column({ title, status, tasks }: ColumnProps) {
  const updateTask = useTaskStore((state) => state.updateTask);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow dropping elements
  };

  const handleDrop = (e: React.DragEvent) => {
    const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(taskId)) {
      updateTask(taskId, { status });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex flex-col rounded-2xl bg-slate-950/40 border border-white/[0.04] p-4 min-h-[500px]"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-200 text-sm tracking-wide uppercase">{title}</h3>
        <span className="rounded-full bg-slate-900 border border-white/[0.08] px-2.5 py-0.5 text-xs font-bold text-slate-400">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.04] p-6 text-center text-xs text-slate-600">
            No items drop here
          </div>
        )}
      </div>
    </div>
  );
}