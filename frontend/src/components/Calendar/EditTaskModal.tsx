import type { Priority, Task } from '@calendar/shared';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

interface EditTaskModalProps {
  task: Task | null;
  dateKey: string;
  onSave: (data: { title: string; priority?: Priority; labels: string[] }, taskId?: string) => void;
  onClose: () => void;
}

const LABEL_COLORS = ['#34d399', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444'];
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

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
`;

const ModalTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
  }
`;

const Section = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const PriorityRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PriorityButton = styled.button<{ active: boolean; priorityColor: string }>`
  flex: 1;
  padding: 6px 0;
  border: 1px solid
    ${({ active, priorityColor, theme }) => (active ? priorityColor : theme.colors.inputBorder)};
  border-radius: ${({ theme }) => theme.borderRadius};
  background: ${({ active, priorityColor }) => (active ? priorityColor + '1a' : 'transparent')};
  color: ${({ active, priorityColor, theme }) =>
    active ? priorityColor : theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ priorityColor }) => priorityColor};
  }
`;

const LabelsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LabelSwatch = styled.button<{ swatchColor: string; selected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid ${({ selected, swatchColor }) => (selected ? swatchColor : 'transparent')};
  background: ${({ swatchColor }) => swatchColor};
  cursor: pointer;
  outline-offset: 2px;
  opacity: ${({ selected }) => (selected ? 1 : 0.5)};
  transition: all 0.15s ease;

  &:hover {
    opacity: 1;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.xl};
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

const SaveButton = styled(Button)`
  background: ${({ theme }) => theme.colors.accent};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  color: #ffffff;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export function EditTaskModal({ task, dateKey: _dateKey, onSave, onClose }: EditTaskModalProps) {
  const theme = useTheme();

  const isEdit = task !== null;
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(task?.title ?? '');
  const [priority, setPriority] = useState<Priority | undefined>(task?.priority ?? undefined);
  const [labels, setLabels] = useState<string[]>(task?.labels ?? []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const toggleLabel = (color: string) => {
    setLabels(prev => (prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]));
  };

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSave({ title: trimmed, priority, labels }, task?.id);
  };

  return (
    <Backdrop onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalTitle>{isEdit ? 'Edit Task' : 'Create Task'}</ModalTitle>

        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter task title..."
          onKeyDown={e => {
            if (e.key === 'Enter') handleSave();
          }}
        />

        <Section>
          <Label>Priority</Label>
          <PriorityRow>
            {PRIORITIES.map(p => (
              <PriorityButton
                key={p}
                active={priority === p}
                priorityColor={theme.priority[p].color}
                onClick={() => setPriority(prev => (prev === p ? undefined : p))}
              >
                {p}
              </PriorityButton>
            ))}
          </PriorityRow>
        </Section>

        <Section>
          <Label>Labels</Label>
          <LabelsRow>
            {LABEL_COLORS.map(color => (
              <LabelSwatch
                key={color}
                swatchColor={color}
                selected={labels.includes(color)}
                onClick={() => toggleLabel(color)}
                aria-label={`Toggle label ${color}`}
              />
            ))}
          </LabelsRow>
        </Section>

        <Footer>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SaveButton onClick={handleSave} disabled={!title.trim()}>
            Save
          </SaveButton>
        </Footer>
      </Modal>
    </Backdrop>
  );
}
