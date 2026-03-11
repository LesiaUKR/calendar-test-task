import type { Priority, Task } from '@calendar/shared';
import type { ReorderItem } from '@calendar/shared';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useCalendar } from '../../hooks/useCalendar';
import { useHolidays } from '../../hooks/useHolidays';
import type { Country } from '../../services/holidayService';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  clearError,
  createTask,
  deleteTask,
  fetchTasksByMonths,
  optimisticReorder,
  reorderTasks,
  updateTask,
} from '../../store/tasksSlice';
import { formatDateKey } from '../../utils/calendar';
import { CalendarHeader } from './CalendarHeader';
import { DayCell } from './DayCell';
import { DayTasksModal } from './DayTasksModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EditTaskModal } from './EditTaskModal';
import { TaskCard } from './TaskCard';

interface CalendarProps {
  countries: Country[];
  country: string;
  onCountryChange: (code: string) => void;
}

const Wrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  background: ${({ theme }) => theme.colors.surface};
`;

const WeekdaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(180px, 1fr));
  min-width: 1260px;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(180px, 1fr));
  grid-auto-rows: 260px;
  min-width: 1260px;
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

const GridContainer = styled.div`
  position: relative;
`;

const GridLoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => `${theme.colors.background}cc`};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: none;
`;

const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2024, 0, 7 + i)));

const todayKey = formatDateKey(new Date());

export function Calendar({ countries, country, onCountryChange }: CalendarProps) {
  const { grid, currentMonth, currentYear, setCalendarDate } = useCalendar();
  const [dropPreview, setDropPreview] = useState<{ dateKey: string; index: number } | null>(null);
  const [highlightedDateKey, setHighlightedDateKey] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<{ task: Task | null; dateKey: string } | null>(
    null
  );
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const holidays = useHolidays(currentYear, country);

  const tasks = useAppSelector(state => state.tasks.tasks);
  const loading = useAppSelector(state => state.tasks.calendarLoading);
  const taskError = useAppSelector(state => state.tasks.error);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!taskError) return;
    toast.error(taskError, {
      style: { color: '#dc2626' },
    });
    dispatch(clearError());
  }, [taskError, dispatch]);

  useEffect(() => {
    const formatMonth = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const current = new Date(currentYear, currentMonth, 1);
    const prev = new Date(currentYear, currentMonth - 1, 1);
    const next = new Date(currentYear, currentMonth + 1, 1);

    dispatch(fetchTasksByMonths([formatMonth(prev), formatMonth(current), formatMonth(next)]));
  }, [dispatch, currentYear, currentMonth]);

  useEffect(() => {
    if (!highlightedDateKey) return;

    const timer = window.setTimeout(() => {
      setHighlightedDateKey(null);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [highlightedDateKey]);

  useEffect(() => {
    if (!highlightedDateKey) return;

    const cell = document.querySelector(
      `[data-date-key="${highlightedDateKey}"]`
    ) as HTMLElement | null;
    if (!cell) return;

    cell.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [highlightedDateKey]);

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
    (
      data: {
        title: string;
        priority?: Priority;
        labels: string[];
        description?: string;
        date?: string;
      },
      taskId?: string
    ) => {
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

  const handleOpenDayTasks = useCallback((dateKey: string) => {
    setExpandedDayKey(dateKey);
  }, []);

  const expandedDayTasks = expandedDayKey ? (tasksByDate.get(expandedDayKey) ?? []) : [];

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find(t => t.id === event.active.id);
      setActiveTask(task ?? null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDropPreview(null);
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

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) {
        setDropPreview(null);
        return;
      }

      const activeId = String(active.id);
      const overId = String(over.id);

      const draggedTask = tasks.find(t => t.id === activeId);
      if (!draggedTask) {
        setDropPreview(null);
        return;
      }

      const overTask = tasks.find(t => t.id === overId);
      const targetDate = overTask
        ? overTask.date
        : overId.startsWith('droppable-')
          ? overId.replace('droppable-', '')
          : overId;

      const targetTasks = tasks
        .filter(t => t.date === targetDate)
        .sort((a, b) => a.order - b.order);

      const index = overTask ? targetTasks.findIndex(t => t.id === overId) : targetTasks.length;

      setDropPreview({ dateKey: targetDate, index: Math.max(0, index) });
    },
    [tasks]
  );

  const handleDragCancel = useCallback(() => {
    setDropPreview(null);
    setActiveTask(null);
  }, []);

  const handleSelectSearchResult = useCallback(
    (task: Task, dateKey: string) => {
      const year = parseInt(task.date.slice(0, 4));
      const month = parseInt(task.date.slice(5, 7)) - 1;
      setCalendarDate(year, month);
      setHighlightedDateKey(dateKey);
    },
    [setCalendarDate]
  );

  return (
    <>
      <CalendarHeader
        countries={countries}
        country={country}
        onCountryChange={onCountryChange}
        onSelectSearchResult={handleSelectSearchResult}
      />
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Wrapper>
          <WeekdaysGrid>
            {WEEKDAYS.map(day => (
              <WeekdayCell key={day}>{day}</WeekdayCell>
            ))}
          </WeekdaysGrid>
          <GridContainer>
            {loading && <GridLoadingOverlay>Loading tasks...</GridLoadingOverlay>}
            <DaysGrid>
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
                      onOpenDayTasks={handleOpenDayTasks}
                      isSearchHighlighted={highlightedDateKey === key}
                      dropPreviewIndex={dropPreview?.dateKey === key ? dropPreview.index : null}
                    />
                  );
                })
              )}
            </DaysGrid>
          </GridContainer>
        </Wrapper>
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} forceDraggingCursor />
          ) : null}
        </DragOverlay>
      </DndContext>
      {expandedDayKey && (
        <DayTasksModal
          dateKey={expandedDayKey}
          tasks={expandedDayTasks}
          onClose={() => setExpandedDayKey(null)}
          onAddTask={dateKey => {
            setExpandedDayKey(null);
            handleAddTask(dateKey);
          }}
          onEditTask={task => {
            setExpandedDayKey(null);
            handleEdit(task);
          }}
          onDeleteTask={task => {
            setExpandedDayKey(null);
            handleDelete(task);
          }}
        />
      )}
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
