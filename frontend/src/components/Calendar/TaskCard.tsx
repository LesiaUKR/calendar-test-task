import type { Task } from '@calendar/shared';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from '@emotion/styled';
import { SquarePen, X } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  box-shadow: ${({ theme }) => theme.colors.cardShadow};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.sm};
  overflow: hidden;
  cursor: grab;
  touch-action: manipulation;

  &:active {
    cursor: grabbing;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-height: 20px;
`;

const Labels = styled.div`
  display: flex;
  gap: 4px;
`;

const LabelBar = styled.div<{ color: string }>`
  height: 4px;
  width: 32px;
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

const PriorityBadge = styled.span<{ priority: string }>`
  display: inline-block;
  margin-top: 4px;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: ${({ theme, priority }) => theme.priority[priority as keyof typeof theme.priority].color};
  background: ${({ theme, priority }) =>
    theme.priority[priority as keyof typeof theme.priority].bg};
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  margin-top: 2px;
  min-width: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 2px;
  margin-left: auto;
  flex-shrink: 0;
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
  color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  padding: 0;

  &:hover {
    background: ${({ theme }) => `${theme.colors.accent}22`};
  }
`;

const DeleteButton = styled(ActionButton)`
  color: ${({ theme }) => theme.colors.deleteHover};

  &:hover {
    background: ${({ theme }) => `${theme.colors.deleteHover}22`};
  }
`;

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TopRow>
        <Labels>
          {task.labels.map(color => (
            <LabelBar key={color} color={color} />
          ))}
        </Labels>
        <Actions onPointerDown={e => e.stopPropagation()}>
          <ActionButton onClick={() => onEdit(task)} aria-label="Edit task">
            <SquarePen size={14} />
          </ActionButton>
          <DeleteButton onClick={() => onDelete(task)} aria-label="Delete task">
            <X size={14} />
          </DeleteButton>
        </Actions>
      </TopRow>

      <BottomRow>
        <Title onPointerDown={e => e.stopPropagation()} onClick={() => onEdit(task)}>
          {task.title}
        </Title>
      </BottomRow>

      {task.priority && <PriorityBadge priority={task.priority}>{task.priority}</PriorityBadge>}
    </Card>
  );
}
