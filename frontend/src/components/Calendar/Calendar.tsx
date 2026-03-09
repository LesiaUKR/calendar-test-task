import type { Priority, Task } from '@calendar/shared';
import styled from '@emotion/styled';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCalendar } from '../../hooks/useCalendar';
import { useHolidays } from '../../hooks/useHolidays';
import type { Country } from '../../services/holidayService';
import { useAppDispatch, useAppSelector } from '../../store';
import { createTask, deleteTask, fetchTasks, updateTask } from '../../store/tasksSlice';
import { formatDateKey } from '../../utils/calendar';
import { CalendarHeader } from './CalendarHeader';
import { DayCell } from './DayCell';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EditTaskModal } from './EditTaskModal';

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
    return map;
  }, [tasks]);

  const [editingState, setEditingState] = useState<{ task: Task | null; dateKey: string } | null>(
    null
  );
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

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

  return (
    <>
      <CalendarHeader
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        countries={countries}
        country={country}
        onCountryChange={onCountryChange}
      />
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
