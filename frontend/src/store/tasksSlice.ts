import type { CreateTaskDto, ReorderItem, Task, UpdateTaskDto } from '@calendar/shared';
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import api from '../services/taskService';

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (month: string) => {
  const { data } = await api.get<Task[]>('/tasks', { params: { month } });
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
  const { data } = await api.put<Task[]>('/tasks/reorder', items);
  return data;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    optimisticReorder(state, action: PayloadAction<ReorderItem[]>) {
      for (const item of action.payload) {
        const task = state.tasks.find(t => t.id === item.id);
        if (task) {
          task.date = item.date;
          task.order = item.order;
        }
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch tasks';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.tasks[index] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      .addCase(reorderTasks.fulfilled, () => {
        // state already updated optimistically
      })
      .addCase(reorderTasks.rejected, (state, action) => {
        state.error = action.error.message ?? 'Failed to reorder tasks';
      });
  },
});

export default tasksSlice.reducer;
export const { optimisticReorder } = tasksSlice.actions;

export const selectFilteredTasks = createSelector(
  [
    (state: { tasks: TasksState }) => state.tasks.tasks,
    (_state: { tasks: TasksState }, query: string) => query,
  ],
  (tasks, query) =>
    query.trim() === ''
      ? tasks
      : tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
);
