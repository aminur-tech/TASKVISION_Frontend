import { create } from 'zustand';
import Cookies from 'js-cookie';
import axios from 'axios';
import api from '@/libs/Api';

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
  error: string | null;
  setSelectedDate: (date: string) => void;
  setError: (error: string | null) => void;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedDate: new Date().toISOString().split('T')[0], // Defaults to Today (YYYY-MM-DD)
  loading: true, // Start with loading true for initial fetch
  error: null,

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().fetchTasks();
  },

  setError: (error) => set({ error }),

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/api/tasks/?date=${get().selectedDate}`);
      set({ tasks: res.data, loading: false });
    } catch (err) {
      let errorMessage = 'Failed to fetch tasks.';
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = Object.values(err.response.data).flat().join(' ');
      }
      set({ loading: false, error: errorMessage, tasks: [] });
    }
  },

  addTask: async (taskData) => {
    try {
      await api.post('/api/tasks/', taskData);
      // Refetch tasks to show the new one
      await get().fetchTasks();
    } catch (err) {
      let errorMessage = 'Failed to create task.';
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = Object.values(err.response.data).flat().join(' ');
      }
      // Re-throw the error to be caught by the UI component for notifications
      throw new Error(errorMessage);
    }
  },

  updateTask: async (id, updates) => {
    const originalTasks = get().tasks;

    // Optimistic update
    const updatedTasks = originalTasks.map(t => t.id === id ? { ...t, ...updates } : t);
    set({ tasks: updatedTasks });

    try {
      await api.patch(`/api/tasks/${id}/`, updates);
    } catch (err) {
      let errorMessage = 'Failed to update task.';
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = Object.values(err.response.data).flat().join(' ');
      }
      // Rollback on error and set an error message in the store
      set({ tasks: originalTasks, error: errorMessage });
    }
  },

  deleteTask: async (id) => {
    const originalTasks = get().tasks;
    // Optimistic update: remove the task from the list immediately
    set({ tasks: originalTasks.filter(t => t.id !== id) });

    try {
      await api.delete(`/api/tasks/${id}/`);
      // If you prefer to refetch after delete instead of optimistic update, you can do:
      // await get().fetchTasks();
    } catch (err) {
      // Rollback on error
      set({ tasks: originalTasks, error: 'Failed to delete task.' });
      // Optionally refetch to ensure data consistency
      await get().fetchTasks();
    }
  }
}));