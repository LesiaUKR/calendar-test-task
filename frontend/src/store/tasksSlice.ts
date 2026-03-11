import type { CreateTaskDto, ReorderItem, Task, UpdateTaskDto } from '@calendar/shared';
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import api from '../services/taskService';

export interface TasksState {
  tasks: Task[]; // month-scoped, used by calendar grid
  allTasks: Task[]; // all tasks, used by search dropdown
  loading: boolean;
  error: string | null;
  lastReorderRollback: ReorderItem[] | null;
  currentFetchRequestId: string | null;
}

const initialState: TasksState = {
  tasks: [],
  allTasks: [],
  loading: false,
  error: null,
  lastReorderRollback: null,
  currentFetchRequestId: null,
};

export const fetchTasksByMonths = createAsyncThunk(
  'tasks/fetchTasksByMonths',
  async (months: string[]) => {
    const uniqueMonths = Array.from(new Set(months));

    const responses = await Promise.all(
      uniqueMonths.map(month => api.get<Task[]>('/tasks', { params: { month } }))
    );

    const merged = new Map<string, Task>();
    for (const response of responses) {
      for (const task of response.data) {
        merged.set(task.id, task);
      }
    }

    return Array.from(merged.values()).sort((a, b) => {
      if (a.date === b.date) return a.order - b.order;
      return a.date.localeCompare(b.date);
    });
  }
);

export const fetchAllTasks = createAsyncThunk('tasks/fetchAllTasks', async () => {
  const { data } = await api.get<Task[]>('/tasks');
  return data;
});

export const createTask = createAsyncThunk('tasks/createTask', async (dto: CreateTaskDto) => {
  const { data } = await api.post<Task>('/tasks', dto);
  return data;
});

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, ...dto }: UpdateTaskDto & { id: string }) => {
    const { data } = await api.patch<Task>(`/tasks/${id}`, dto);
    return data;
  }
);

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id: string) => {
  await api.delete(`/tasks/${id}`);
  return id;
});

export const reorderTasks = createAsyncThunk('tasks/reorderTasks', async (items: ReorderItem[]) => {
  const { data } = await api.put<{ success: boolean }>('/tasks/reorder', items);
  return data;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    optimisticReorder(state, action: PayloadAction<ReorderItem[]>) {
      const rollback: ReorderItem[] = [];

      for (const item of action.payload) {
        const task = state.tasks.find(t => t.id === item.id);
        if (!task) continue;

        rollback.push({
          id: task.id,
          date: task.date,
          order: task.order,
        });

        task.date = item.date;
        task.order = item.order;

        const taskInAll = state.allTasks.find(t => t.id === item.id);
        if (taskInAll) {
          taskInAll.date = item.date;
          taskInAll.order = item.order;
        }
      }
      state.lastReorderRollback = rollback;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
        state.allTasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.tasks[index] = action.payload;
        const allIndex = state.allTasks.findIndex(t => t.id === action.payload.id);
        if (allIndex !== -1) state.allTasks[allIndex] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        state.allTasks = state.allTasks.filter(t => t.id !== action.payload);
      })
      .addCase(reorderTasks.fulfilled, state => {
        state.lastReorderRollback = null;
      })
      .addCase(reorderTasks.rejected, (state, action) => {
        if (state.lastReorderRollback) {
          for (const item of state.lastReorderRollback) {
            const task = state.tasks.find(t => t.id === item.id);
            if (task) {
              task.date = item.date;
              task.order = item.order;
            }
            const taskInAll = state.allTasks.find(t => t.id === item.id);
            if (taskInAll) {
              taskInAll.date = item.date;
              taskInAll.order = item.order;
            }
          }
          state.lastReorderRollback = null;
        }

        state.error = action.error.message ?? 'Failed to reorder tasks';
      })
      .addCase(fetchAllTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.allTasks = action.payload;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch tasks';
      })
      .addCase(fetchTasksByMonths.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentFetchRequestId = action.meta.requestId;
      })
      .addCase(fetchTasksByMonths.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.currentFetchRequestId = null;
      })
      .addCase(fetchTasksByMonths.rejected, (state, action) => {
        if (state.currentFetchRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch tasks';
        state.currentFetchRequestId = null;
      });
  },
});

export default tasksSlice.reducer;
export const { optimisticReorder } = tasksSlice.actions;

export const selectFilteredTasks = createSelector(
  [
    (state: { tasks: TasksState }) => state.tasks.allTasks,
    (_state: { tasks: TasksState }, query: string) => query,
  ],
  (tasks, query) =>
    query.trim() === ''
      ? tasks
      : tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
);
