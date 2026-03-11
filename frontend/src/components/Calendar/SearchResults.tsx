import type { Task } from '@calendar/shared';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import { formatDateKey } from '../../utils/calendar';

interface SearchResultsProps {
  tasks: Task[];
  highlightedIndex: number;
  selectedTaskId?: string | null;
  onSelect: (task: Task) => void;
}

const PAGE_SIZE = 5;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 300px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.colors.cardShadow};
  z-index: 100;
  margin-top: 4px;
`;

const ResultRow = styled.div<{ isActive: boolean; isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 10px 14px;
  cursor: pointer;
  background: ${({ theme, isActive, isSelected }) =>
    isActive || isSelected ? theme.colors.surfaceHover : 'transparent'};
  transition: background-color 100ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:first-of-type {
    border-radius: 10px 10px 0 0;
  }
`;

const DateText = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  min-width: 100px;
`;

const Title = styled.span`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PriorityBadge = styled.span<{ priorityColor: string; priorityBg: string }>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  color: ${({ priorityColor }) => priorityColor};
  background: ${({ priorityBg }) => priorityBg};
  white-space: nowrap;
`;

const LabelsGroup = styled.div`
  display: flex;
  gap: 3px;
  align-items: center;
`;

const LabelDot = styled.span<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const TodayBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.todayBadge};
  white-space: nowrap;
`;

const EmptyMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 10px;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: transparent;
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 600;
  cursor: pointer;
  border-radius: 0 0 10px 10px;
  transition: background-color 100ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:focus-visible {
    outline: none;
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

export function SearchResults({
  tasks,
  highlightedIndex,
  onSelect,
  selectedTaskId,
}: SearchResultsProps) {
  const theme = useTheme();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const todayKey = formatDateKey(new Date());

  // Reset pagination when results change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [tasks]);

  // Auto-expand when keyboard nav exceeds visible items
  useEffect(() => {
    if (highlightedIndex >= visibleCount) {
      setVisibleCount(prev => Math.max(prev, highlightedIndex + 1));
    }
  }, [highlightedIndex, visibleCount]);

  const visibleTasks = tasks.slice(0, visibleCount);
  const hasMore = visibleCount < tasks.length;

  if (tasks.length === 0) {
    return (
      <Dropdown role="listbox" id="search-results-listbox">
        <EmptyMessage>No results found</EmptyMessage>
      </Dropdown>
    );
  }

  return (
    <Dropdown role="listbox" id="search-results-listbox">
      {visibleTasks.map((task, index) => {
        const date = new Date(task.date + 'T00:00:00');
        const priorityStyle = task.priority ? theme.priority[task.priority] : null;

        return (
          <ResultRow
            key={task.id}
            id={`search-result-${index}`}
            role="option"
            aria-selected={index === highlightedIndex}
            isActive={index === highlightedIndex}
            isSelected={task.id === selectedTaskId}
            onClick={() => onSelect(task)}
          >
            <DateText>{dateFormatter.format(date)}</DateText>
            <Title>{task.title}</Title>
            {task.date === todayKey && <TodayBadge>Today</TodayBadge>}
            {task.labels.length > 0 && (
              <LabelsGroup>
                {task.labels.map(label => (
                  <LabelDot key={label} color={label} />
                ))}
              </LabelsGroup>
            )}
            {priorityStyle && (
              <PriorityBadge priorityColor={priorityStyle.color} priorityBg={priorityStyle.bg}>
                {task.priority}
              </PriorityBadge>
            )}
          </ResultRow>
        );
      })}
      {hasMore && (
        <LoadMoreButton onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}>
          Show more ({tasks.length - visibleCount} remaining)
        </LoadMoreButton>
      )}
    </Dropdown>
  );
}
