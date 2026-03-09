import styled from '@emotion/styled';
import { useCallback, useMemo } from 'react';

import { useCalendar } from '../../hooks/useCalendar';
import { useHolidays } from '../../hooks/useHolidays';
import type { Country } from '../../services/holidayService';
import { useAppSelector } from '../../store';
import { formatDateKey } from '../../utils/calendar';
import { CalendarHeader } from './CalendarHeader';
import { DayCell } from './DayCell';

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

  const tasksByDate = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const task of tasks) {
      const existing = map.get(task.date) ?? [];
      existing.push(task);
      map.set(task.date, existing);
    }
    return map;
  }, [tasks]);

  const handleAddTask = useCallback((_dateKey: string) => {
    // Will open EditTaskModal in Issue #13
  }, []);

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
                />
              );
            })
          )}
        </Grid>
      </Wrapper>
    </>
  );
}
