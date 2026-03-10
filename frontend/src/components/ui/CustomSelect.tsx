import styled from '@emotion/styled';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type SelectValue = string | number;

export interface SelectOption<T extends SelectValue> {
  value: T;
  label: string;
}

interface CustomSelectProps<T extends SelectValue> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: 'md' | 'lg';
  minWidth?: string;
  borderMode?: 'transparent' | 'light';
  width?: string;
  onMenuScroll?: (event: React.UIEvent<HTMLUListElement>) => void;
  onMenuWheel?: (event: React.WheelEvent<HTMLUListElement>) => void;
}

const Wrap = styled.div<{ minWidth?: string; width?: string }>`
  position: relative;
  min-width: ${({ minWidth }) => minWidth ?? '180px'};
  width: ${({ width }) => width ?? 'auto'};
`;

const Trigger = styled.button<{
  size: 'md' | 'lg';
  isOpen: boolean;
  borderMode: 'transparent' | 'light';
}>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: 10px;
  border: 1px solid
    ${({ theme, isOpen, borderMode }) =>
      isOpen
        ? theme.colors.accent
        : borderMode === 'transparent'
          ? 'transparent'
          : theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;
  padding: ${({ size }) => (size === 'lg' ? '6px 12px' : '10px 14px')};
  font-size: ${({ theme, size }) => (size === 'lg' ? '22px' : theme.font.size.md)};
  font-weight: ${({ size }) => (size === 'lg' ? 600 : 400)};
  box-shadow: ${({ theme, isOpen }) => (isOpen ? `0 0 0 3px ${theme.colors.accent}33` : 'none')};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
  }
`;

const Label = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Menu = styled.ul`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 4px;
  list-style: none;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.background};
  max-height: 260px;
  overflow-y: auto;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
  z-index: 50;
`;

const OptionButton = styled.button<{ active: boolean }>`
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  text-align: left;
  background: ${({ active }) => (active ? 'transparent' : 'transparent')};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  font-weight: 400;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 1px;
  }
`;

export function CustomSelect<T extends SelectValue>({
  value,
  options,
  onChange,
  ariaLabel,
  size = 'md',
  minWidth,
  width,
  borderMode = 'light',
  onMenuScroll,
  onMenuWheel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const onOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen]);

  return (
    <Wrap ref={rootRef} minWidth={minWidth} width={width}>
      <Trigger
        type="button"
        size={size}
        isOpen={isOpen}
        borderMode={borderMode}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <Label>{selected?.label ?? String(value)}</Label>
        <ChevronDown size={16} />
      </Trigger>

      {isOpen && (
        <Menu role="listbox" aria-label={ariaLabel} onScroll={onMenuScroll} onWheel={onMenuWheel}>
          {options.map(option => (
            <li key={String(option.value)}>
              <OptionButton
                type="button"
                role="option"
                aria-selected={option.value === value}
                active={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </OptionButton>
            </li>
          ))}
        </Menu>
      )}
    </Wrap>
  );
}
