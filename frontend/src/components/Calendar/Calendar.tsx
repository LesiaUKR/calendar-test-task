import type { Priority, Task } from '@calendar/shared';
import type { ReorderItem } from '@calendar/shared';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCalendar } from '../../hooks/useCalendar';
import { useHolidays } from '../../hooks/useHolidays';
import type { Country } from '../../services/holidayService';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  createTask,
  deleteTask,
  fetchTasks,
  optimisticReorder,
  reorderTasks,
  updateTask,
} from '../../store/tasksSlice';
import { formatDateKey } from '../../utils/calendar';
import { CalendarHeader } from './CalendarHeader';
import { DayCell } from './DayCell';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EditTaskModal } from './EditTaskModal';
import { TaskCard } from './TaskCard';

interface CalendarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  countries: Country[];
  country: string;
  onCountryChange: (code: string) => void;
}

const Wrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: auto;
  grid-auto-rows: minmax(120px, 1fr);
`;

const WeekdayCell = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  border-right: 1px solid ${({ theme }) => theme.colors.border};

  &:last-of-type {
    border-right: none;
  }
`;

const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2024, 0, 7 + i)));

const todayKey = formatDateKey(new Date());

export function Calendar({
  isDark,
  onToggleTheme,
  countries,
  country,
  onCountryChange,
}: CalendarProps) {
  const { grid, currentMonth, currentYear } = useCalendar();
  const holidays = useHolidays(currentYear, country);
  const tasks = useAppSelector(state => state.tasks.tasks);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const month = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    dispatch(fetchTasks(month));
  }, [dispatch, currentYear, currentMonth]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const task of tasks) {
      const existing = map.get(task.date) ?? [];
      existing.push(task);
      map.set(task.date, existing);
    }
    for (const [dateKey, tasksForDate] of map.entries()) {
      map.set(
        dateKey,
        [...tasksForDate].sort((a, b) => a.order - b.order)
      );
    }
    return map;
  }, [tasks]);

  const [editingState, setEditingState] = useState<{ task: Task | null; dateKey: string } | null>(
    null
  );
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleAddTask = useCallback((dateKey: string) => {
    setEditingState({ task: null, dateKey });
  }, []);

  const handleEdit = useCallback((task: Task) => {
    setEditingState({ task, dateKey: task.date });
  }, []);

  const handleDelete = useCallback((task: Task) => {
    setDeletingTask(task);
  }, []);

  const handleSave = useCallback(
    (data: { title: string; priority?: Priority; labels: string[] }, taskId?: string) => {
      if (taskId) {
        dispatch(updateTask({ id: taskId, ...data }));
      } else if (editingState?.dateKey) {
        const tasksForDate = tasksByDate.get(editingState.dateKey) ?? [];
        dispatch(createTask({ ...data, date: editingState.dateKey, order: tasksForDate.length }));
      }
      setEditingState(null);
    },
    [dispatch, editingState?.dateKey, tasksByDate]
  );

  const handleConfirmDelete = useCallback(
    (taskId: string) => {
      dispatch(deleteTask(taskId));
      setDeletingTask(null);
    },
    [dispatch]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find(t => t.id === event.active.id);
      setActiveTask(task ?? null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const draggedTask = tasks.find(t => t.id === activeId);
      if (!draggedTask) return;

      const sourceDate = draggedTask.date;

      // over.id is either a task ID or a dateKey (droppable cell)
      const overTask = tasks.find(t => t.id === overId);
      const targetDate = overTask
        ? overTask.date
        : overId.startsWith('droppable-')
          ? overId.replace('droppable-', '')
          : overId;

      const sourceTasks = tasks
        .filter(t => t.date === sourceDate)
        .sort((a, b) => a.order - b.order);

      if (sourceDate === targetDate) {
        // same-cell reorder
        const oldIndex = sourceTasks.findIndex(t => t.id === activeId);
        const newIndex = sourceTasks.findIndex(t => t.id === overId);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(sourceTasks, oldIndex, newIndex);
        const items: ReorderItem[] = reordered.map((t, i) => ({
          id: t.id,
          date: sourceDate,
          order: i,
        }));

        dispatch(optimisticReorder(items));
        dispatch(reorderTasks(items));
      } else {
        // cross-cell move
        const targetTasks = tasks
          .filter(t => t.date === targetDate)
          .sort((a, b) => a.order - b.order);

        // remove from source
        const newSource = sourceTasks.filter(t => t.id !== activeId);

        // insert into target at drop position
        const overIndex = overTask
          ? targetTasks.findIndex(t => t.id === overId)
          : targetTasks.length;
        const newTarget = [...targetTasks];
        newTarget.splice(overIndex, 0, draggedTask);

        const items: ReorderItem[] = [
          ...newSource.map((t, i) => ({ id: t.id, date: sourceDate, order: i })),
          ...newTarget.map((t, i) => ({ id: t.id, date: targetDate, order: i })),
        ];

        dispatch(optimisticReorder(items));
        dispatch(reorderTasks(items));
      }
    },
    [tasks, dispatch]
  );

  return (
    <>
      <CalendarHeader
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        countries={countries}
        country={country}
        onCountryChange={onCountryChange}
      />
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Wrapper>
          <Grid>
            {WEEKDAYS.map(day => (
              <WeekdayCell key={day}>{day}</WeekdayCell>
            ))}
            {grid.map(week =>
              week.map(date => {
                const key = formatDateKey(date);
                const isBoundary = date.getMonth() !== currentMonth;
                const isToday = key === todayKey;

                return (
                  <DayCell
                    key={key}
                    date={date}
                    isBoundary={isBoundary}
                    isToday={isToday}
                    tasks={tasksByDate.get(key) ?? []}
                    holidays={holidays.get(key) ?? []}
                    onAddTask={handleAddTask}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                );
              })
            )}
          </Grid>
        </Wrapper>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} /> : null}
        </DragOverlay>
      </DndContext>
      {editingState && (
        <EditTaskModal
          task={editingState.task}
          dateKey={editingState.dateKey}
          onSave={handleSave}
          onClose={() => setEditingState(null)}
        />
      )}

      {deletingTask && (
        <DeleteConfirmModal
          task={deletingTask}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingTask(null)}
        />
      )}
    </>
  );
}
