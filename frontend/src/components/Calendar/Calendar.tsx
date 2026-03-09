import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';

import { useCalendar } from '../../hooks/useCalendar';
import type { Country } from '../../services/holidayService';
import { formatDateKey } from '../../utils/calendar';
import { CalendarHeader } from './CalendarHeader';

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

const Cell = styled.div<{ isBoundary: boolean; isToday: boolean }>`
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.sm};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, isToday, isBoundary }) =>
    isToday ? theme.colors.today : isBoundary ? theme.colors.surface : theme.colors.background};
  opacity: ${({ isBoundary }) => (isBoundary ? 0.5 : 1)};
  pointer-events: ${({ isBoundary }) => (isBoundary ? 'none' : 'auto')};
  touch-action: manipulation;

  &:nth-of-type(7n + 7) {
    border-right: none;
  }
`;

const DateNumber = styled.span`
  font-variant-numeric: tabular-nums;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
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
  const { grid, currentMonth } = useCalendar();

  return (
    <>
      <Global
        styles={css`
          body {
            margin: 0;
            background: ${isDark ? '#121212' : '#ffffff'};
            transition: background 0.2s;
          }
        `}
      />
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
                <Cell key={key} isBoundary={isBoundary} isToday={isToday}>
                  <DateNumber>{date.getDate()}</DateNumber>
                </Cell>
              );
            })
          )}
        </Grid>
      </Wrapper>
    </>
  );
}
