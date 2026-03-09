import type { Task } from '@calendar/shared';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styled from '@emotion/styled';

import type { PublicHoliday } from '../../services/holidayService';
import { formatDateKey } from '../../utils/calendar';
import { HolidayBadge } from './HolidayBadge';

interface DayCellProps {
  date: Date;
  isBoundary: boolean;
  isToday: boolean;
  tasks: Task[];
  holidays: PublicHoliday[];
  onAddTask: (dateKey: string) => void;
}

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
  display: flex;
  flex-direction: column;
  position: relative;

  &:nth-of-type(7n + 7) {
    border-right: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const DateNum = styled.span`
  font-variant-numeric: tabular-nums;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const TodayBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.todayBadge};
  color: #ffffff;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

const TaskCount = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TasksContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  overflow: hidden;
`;

const AddButton = styled.button`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px dashed ${({ theme }) => theme.colors.addButtonBorder};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.addButtonText};
  font-size: ${({ theme }) => theme.font.size.md};
  transition: opacity 0.15s ease;
  opacity: 0;

  ${Cell}:hover & {
    opacity: 1;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

export function DayCell({ date, isBoundary, isToday, tasks, holidays, onAddTask }: DayCellProps) {
  const dateKey = formatDateKey(date);
  const dayNumber = date.getDate();
  const taskIds = tasks.map(t => t.id);

  return (
    <Cell isBoundary={isBoundary} isToday={isToday}>
      <Header>
        {isToday && !isBoundary ? (
          <TodayBadge>{dayNumber}</TodayBadge>
        ) : (
          <DateNum>{dayNumber}</DateNum>
        )}
        {tasks.length > 0 && (
          <TaskCount>
            {tasks.length} card{tasks.length !== 1 ? 's' : ''}
          </TaskCount>
        )}
      </Header>

      {holidays.map(h => (
        <HolidayBadge key={h.name} holiday={h} />
      ))}

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <TasksContainer>
          {/* TaskCard components will be rendered here in Issue #13 */}
        </TasksContainer>
      </SortableContext>

      {!isBoundary && (
        <AddButton onClick={() => onAddTask(dateKey)} aria-label={`Add task for ${dateKey}`}>
          +
        </AddButton>
      )}
    </Cell>
  );
}
