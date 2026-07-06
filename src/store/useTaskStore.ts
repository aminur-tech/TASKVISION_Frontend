import { create } from 'zustand';
import Cookies from 'js-cookie';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date: string;
  tags: string[];
}

interface TaskState {
  tasks: Task[];
  selectedDate: string;
  loading: boolean;
  setSelectedDate: (date: string) => void;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedDate: new Date().toISOString().split('T')[0], // Defaults to Today (YYYY-MM-DD)
  loading: false,

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().fetchTasks();
  },

  fetchTasks: async () => {
    set({ loading: true });
    const token = Cookies.get('token');
    try {
      const res = await fetch(`http://localhost:8000/api/tasks/?date=${get().selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        set({ tasks: data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      set({ loading: false });
    }
  },

  addTask: async (taskData) => {
    const token = Cookies.get('token');
    const res = await fetch(`http://localhost:8000/api/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      // This allows the custom Error/Success message modal on your page to catch it!
      throw new Error(errorData.detail || 'Failed to create task on the server.');
    }

    // CRITICAL FIX: Await the fetch so that state updates BEFORE the modal action wraps up
    await get().fetchTasks();
  },

  updateTask: async (id, updates) => {
    const token = Cookies.get('token');
    const originalTasks = get().tasks;
    
    // Optimistic update
    set({ tasks: originalTasks.map(t => t.id === id ? { ...t, ...updates } : t) });

    const res = await fetch(`http://localhost:8000/api/tasks/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    
    if (!res.ok) set({ tasks: originalTasks }); // Rollback if server fails
  },

  deleteTask: async (id) => {
    const token = Cookies.get('token');
    const res = await fetch(`http://localhost:8000/api/tasks/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (res.ok) {
      await get().fetchTasks();
    }
  }
}));