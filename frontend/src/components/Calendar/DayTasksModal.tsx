import type { Task } from '@calendar/shared';
import styled from '@emotion/styled';
import { Plus, SquarePen, X } from 'lucide-react';
import { useEffect } from 'react';

interface DayTasksModalProps {
  dateKey: string;
  tasks: Task[];
  onClose: () => void;
  onAddTask: (dateKey: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 120;
`;

const Modal = styled.div`
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HeaderMain = styled.div`
  min-width: 0;
`;

const Weekday = styled.div`
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DateTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text};
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const Body = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  overflow: auto;
  flex: 1;
`;

const CountText = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TaskItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.cardBg};
  box-shadow: ${({ theme }) => theme.colors.cardShadow};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.sm};
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
  min-width: 0;
`;

const Labels = styled.div`
  display: flex;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

const LabelBar = styled.span<{ color: string }>`
  height: 4px;
  flex: 1 1 0;
  max-width: 32px;
  min-width: 6px;
  border-radius: 2px;
  background: ${({ color }) => color};
`;

const Actions = styled.div`
  display: flex;
  gap: 2px;
  margin-left: auto;
`;

const ActionButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

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

const Title = styled.button`
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
`;

const PriorityBadge = styled.span<{ priority: string }>`
  display: inline-block;
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: 2px 5px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme, priority }) => theme.priority[priority as keyof typeof theme.priority].color};
  background: ${({ theme, priority }) =>
    theme.priority[priority as keyof typeof theme.priority].bg};
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.lg} 0;
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Footer = styled.footer`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
`;

const AddButton = styled.button`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.accent};
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
    border-color: ${({ theme }) => theme.colors.accentHover};
  }
`;

const AddText = styled.span`
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
`;

export function DayTasksModal({
  dateKey,
  tasks,
  onClose,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: DayTasksModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const date = new Date(`${dateKey}T00:00:00`);
  const weekday = weekdayFormatter.format(date).toUpperCase();

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <HeaderMain>
            <Weekday>{weekday}</Weekday>
            <DateTitle>{dateFormatter.format(date)}</DateTitle>
          </HeaderMain>
          <CloseButton onClick={onClose} aria-label="Close tasks modal">
            <X size={30} />
          </CloseButton>
        </Header>

        <Body>
          <CountText>
            {tasks.length} task{tasks.length === 1 ? '' : 's'}
          </CountText>
          <Divider />
          {tasks.length === 0 ? (
            <EmptyState>No tasks for this day yet.</EmptyState>
          ) : (
            <TaskList>
              {tasks.map(task => (
                <TaskItem key={task.id}>
                  <TopRow>
                    <Labels>
                      {task.labels.map(color => (
                        <LabelBar key={color} color={color} />
                      ))}
                    </Labels>
                    <Actions>
                      <ActionButton onClick={() => onEditTask(task)} aria-label="Edit task">
                        <SquarePen size={20} />
                      </ActionButton>
                      <DeleteButton onClick={() => onDeleteTask(task)} aria-label="Delete task">
                        <X size={20} />
                      </DeleteButton>
                    </Actions>
                  </TopRow>

                  <Title onClick={() => onEditTask(task)}>{task.title}</Title>

                  {task.priority && (
                    <PriorityBadge priority={task.priority}>{task.priority}</PriorityBadge>
                  )}
                </TaskItem>
              ))}
            </TaskList>
          )}
        </Body>

        <Footer>
          <AddButton onClick={() => onAddTask(dateKey)}>
            <Plus size={28} />
            <AddText>Add Task</AddText>
          </AddButton>
        </Footer>
      </Modal>
    </Backdrop>
  );
}
