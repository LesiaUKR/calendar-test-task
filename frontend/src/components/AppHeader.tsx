import styled from '@emotion/styled';
import { Moon, Sun } from 'lucide-react';

interface AppHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  background: ${({ theme }) =>
    theme.colors.background === '#121212' ? 'rgba(18, 18, 18, 0.72)' : 'rgba(251, 251, 253, 0.72)'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Inner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  height: 52px;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Logo = styled.img`
  width: 28px;
  height: 28px;
  display: block;
`;

const BrandText = styled.span`
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.022em;
  color: ${({ theme }) => theme.colors.text};
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const ThemeButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-size: 16px;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
    outline: none;
  }
`;

export function AppHeader({ isDark, onToggleTheme }: AppHeaderProps) {
  return (
    <Header>
      <Inner>
        <Brand>
          <Logo src="/favicon.svg" alt="My Calendar logo" />
          <BrandText>My Calendar</BrandText>
        </Brand>

        <Right>
          <ThemeButton onClick={onToggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </ThemeButton>
        </Right>
      </Inner>
    </Header>
  );
}
