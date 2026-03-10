import type { Task } from '@calendar/shared';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styled from '@emotion/styled';
import { useState } from 'react';

import type { PublicHoliday } from '../../services/holidayService';
import { formatDateKey } from '../../utils/calendar';
import { HolidayBadge } from './HolidayBadge';
import { TaskCard } from './TaskCard';

interface DayCellProps {
  date: Date;
  isBoundary: boolean;
  isToday: boolean;
  tasks: Task[];
  holidays: PublicHoliday[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddTask: (dateKey: string) => void;
  dropPreviewIndex?: number | null;
}

const Cell = styled.div<{ isBoundary: boolean; isToday: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm};
  overflow: hidden;
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
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  overflow: hidden;
`;

const AddButton = styled.button<{ visible: boolean }>`
  margin-top: ${({ theme }) => theme.spacing.xs};
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
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  pointer-events: ${({ visible }) => (visible ? 'auto' : 'none')};

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const MoreLink = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
  cursor: default;
`;

const DropIndicator = styled.div`
  height: 1px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.accent};
  margin: 2px 0;
`;

export function DayCell({
  date,
  isBoundary,
  isToday,
  tasks,
  holidays,
  onAddTask,
  onEdit,
  onDelete,
  dropPreviewIndex,
}: DayCellProps) {
  const [isCellHovered, setIsCellHovered] = useState(false);
  const [isTaskCardHovered, setIsTaskCardHovered] = useState(false);

  const MAX_VISIBLE = 2;
  const dateKey = formatDateKey(date);
  const dayNumber = date.getDate();
  const visibleTasks = tasks.slice(0, MAX_VISIBLE);
  const hiddenCount = tasks.length - visibleTasks.length;
  const taskIds = visibleTasks.map(t => t.id);

  const showAddButton = isCellHovered && !isTaskCardHovered;

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `droppable-${dateKey}`,
  });

  return (
    <Cell
      ref={setDroppableRef}
      isBoundary={isBoundary}
      isToday={isToday}
      onMouseEnter={() => setIsCellHovered(true)}
      onMouseLeave={() => {
        setIsCellHovered(false);
        setIsTaskCardHovered(false);
      }}
    >
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
          {visibleTasks.map((task, i) => (
            <div
              key={task.id}
              onMouseEnter={() => setIsTaskCardHovered(true)}
              onMouseLeave={() => setIsTaskCardHovered(false)}
            >
              {dropPreviewIndex === i && <DropIndicator />}
              <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
            </div>
          ))}
          {dropPreviewIndex === visibleTasks.length && <DropIndicator />}
        </TasksContainer>
      </SortableContext>

      {hiddenCount > 0 && <MoreLink>+{hiddenCount} more</MoreLink>}

      {!isBoundary && (
        <AddButton
          visible={showAddButton}
          onClick={() => onAddTask(dateKey)}
          aria-label={`Add task for ${dateKey}`}
        >
          +
        </AddButton>
      )}
    </Cell>
  );
}
