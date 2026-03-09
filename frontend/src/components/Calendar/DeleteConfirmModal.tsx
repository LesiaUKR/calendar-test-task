import type { Task } from '@calendar/shared';
import styled from '@emotion/styled';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

interface DeleteConfirmModalProps {
  task: Task;
  onConfirm: (taskId: string) => void;
  onClose: () => void;
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.xl};
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.error};
`;

const Title = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Message = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

const TaskNameRow = styled.span`
  display: flex;
  justify-content: center;
`;

const TaskName = styled.strong`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text};
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Button = styled.button`
  padding: 8px 20px;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
`;

const CancelButton = styled(Button)`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const DeleteButton = styled(Button)`
  background: ${({ theme }) => theme.colors.error};
  border: 1px solid ${({ theme }) => theme.colors.error};
  color: #ffffff;

  &:hover {
    background: ${({ theme }) => theme.colors.deleteHover};
    border-color: ${({ theme }) => theme.colors.deleteHover};
  }
`;

export function DeleteConfirmModal({ task, onConfirm, onClose }: DeleteConfirmModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <IconWrapper>
          <AlertTriangle size={40} />
        </IconWrapper>

        <Title>Delete Task</Title>

        <Message>
          <span>Are you sure you want to delete</span>
          <TaskNameRow>
            <TaskName>&ldquo;{task.title}&rdquo;</TaskName> ?
          </TaskNameRow>
          <span>This action cannot be undone.</span>
        </Message>

        <Footer>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <DeleteButton onClick={() => onConfirm(task.id)}>Delete</DeleteButton>
        </Footer>
      </Modal>
    </Backdrop>
  );
}
