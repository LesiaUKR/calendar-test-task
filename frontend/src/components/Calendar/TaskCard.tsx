import type { Task } from '@calendar/shared';
import styled from '@emotion/styled';
import { Pencil, X } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const Card = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.cardBg};
  box-shadow: ${({ theme }) => theme.colors.cardShadow};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  cursor: grab;
  touch-action: manipulation;

  &:active {
    cursor: grabbing;
  }
`;

const Labels = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const LabelBar = styled.div<{ color: string }>`
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: ${({ color }) => color};
`;

const Title = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;

const PriorityDot = styled.span<{ priority: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme, priority }) => theme.priority[priority as keyof typeof theme.priority]};
  margin-left: ${({ theme }) => theme.spacing.xs};
  flex-shrink: 0;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 2px;
`;

const Actions = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.xs};
  right: ${({ theme }) => theme.spacing.xs};
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover {
    color: ${({ theme }) => theme.colors.deleteHover};
  }
`;

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card>
      {task.labels.length > 0 && (
        <Labels>
          {task.labels.map(color => (
            <LabelBar key={color} color={color} />
          ))}
        </Labels>
      )}

      <BottomRow>
        <Title onClick={() => onEdit(task)}>{task.title}</Title>
        {task.priority && <PriorityDot priority={task.priority} />}
      </BottomRow>

      <Actions>
        <ActionButton onClick={() => onEdit(task)} aria-label="Edit task">
          <Pencil size={12} />
        </ActionButton>
        <DeleteButton onClick={() => onDelete(task)} aria-label="Delete task">
          <X size={12} />
        </DeleteButton>
      </Actions>
    </Card>
  );
}
