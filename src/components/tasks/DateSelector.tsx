
import { useTaskStore } from '@/store/useTaskStore';

export function DateSelector() {
  const { selectedDate, setSelectedDate } = useTaskStore();

  return (
    <div className="flex items-center gap-3 bg-slate-900 border border-white/[0.08] px-4 py-2 rounded-xl">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Date</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="bg-transparent text-white font-medium focus:outline-none scheme-dark text-sm cursor-pointer"
      />
    </div>
  );
}