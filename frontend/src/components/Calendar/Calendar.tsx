import styled from '@emotion/styled';

import { useCalendar } from '../../hooks/useCalendar';
import { formatDateKey } from '../../utils/calendar';

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

  &:nth-of-type(7n) {
    border-right: none;
  }
`;

const DateNumber = styled.span`
  font-variant-numeric: tabular-nums;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const todayKey = formatDateKey(new Date());

export function Calendar() {
  const { grid, currentMonth } = useCalendar();

  return (
    <Wrapper>
      <Grid>
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
  );
}
