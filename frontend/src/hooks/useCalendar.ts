import { useCallback, useMemo } from 'react';

import { useAppDispatch, useAppSelector } from '../store';
import { nextMonth, prevMonth, setMonth, setYear } from '../store/calendarSlice';
import { buildCalendarGrid } from '../utils/calendar';

const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

export function useCalendar() {
  const dispatch = useAppDispatch();
  const currentYear = useAppSelector(s => s.calendar.currentYear);
  const currentMonth = useAppSelector(s => s.calendar.currentMonth);

  const grid = useMemo(
    () => buildCalendarGrid(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const currentLabel = useMemo(
    () => monthYearFormatter.format(new Date(currentYear, currentMonth)),
    [currentYear, currentMonth]
  );

  const goToPrevMonth = useCallback(() => dispatch(prevMonth()), [dispatch]);
  const goToNextMonth = useCallback(() => dispatch(nextMonth()), [dispatch]);
  const setCalendarMonth = useCallback((month: number) => dispatch(setMonth(month)), [dispatch]);
  const setCalendarYear = useCallback((year: number) => dispatch(setYear(year)), [dispatch]);

  return {
    grid,
    currentYear,
    currentMonth,
    currentLabel,
    goToPrevMonth,
    goToNextMonth,
    setCalendarMonth,
    setCalendarYear,
  };
}
