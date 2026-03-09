import styled from '@emotion/styled';
import { ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCalendar } from '../../hooks/useCalendar';
import type { Country } from '../../services/holidayService';
import { useAppDispatch } from '../../store';
import { setQuery } from '../../store/searchSlice';

interface CalendarHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  countries: Country[];
  country: string;
  onCountryChange: (code: string) => void;
}

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const NavButton = styled.button`
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
  font-size: 18px;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
    outline: none;
  }
`;

const MonthSelect = styled.select`
  font-size: 22px;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid transparent;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  outline: none;
  padding: 6px 12px;
  letter-spacing: -0.02em;
  transition: all 0.15s ease;

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
    outline: none;
  }

  option {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-size: 14px;
    font-weight: 400;
  }
`;

const YearSelect = styled.select`
  font-size: 22px;
  font-weight: 600;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid transparent;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  outline: none;
  padding: 6px 12px;
  transition: all 0.15s ease;

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
    outline: none;
  }

  option {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    font-size: 14px;
    font-weight: 400;
  }
`;

const CountrySelect = styled.select`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
    outline: none;
  }
`;

const SearchInput = styled.input`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  width: 220px;
  outline: none;
  transition: all 0.15s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
  }
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
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
    outline: none;
  }
`;

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
const MONTHS = Array.from({ length: 12 }, (_, i) => monthFormatter.format(new Date(2024, i)));

export function CalendarHeader({
  isDark,
  onToggleTheme,
  countries,
  country,
  onCountryChange,
}: CalendarHeaderProps) {
  const dispatch = useAppDispatch();
  const {
    currentYear,
    currentMonth,
    goToPrevMonth,
    goToNextMonth,
    setCalendarMonth,
    setCalendarYear,
  } = useCalendar();

  const [searchValue, setSearchValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const yearRange = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch(setQuery(value));
      }, 300);
    },
    [dispatch]
  );

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setSearchValue('');
        dispatch(setQuery(''));
        if (debounceRef.current) clearTimeout(debounceRef.current);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <Header>
      <NavGroup>
        <NavButton onClick={goToPrevMonth} aria-label="Previous month">
          <ChevronLeft size={18} />
        </NavButton>
        <MonthSelect
          value={currentMonth}
          onChange={e => setCalendarMonth(Number(e.target.value))}
          aria-label="Select month"
        >
          {MONTHS.map((name, i) => (
            <option key={name} value={i}>
              {name}
            </option>
          ))}
        </MonthSelect>

        <YearSelect
          value={currentYear}
          onChange={e => setCalendarYear(Number(e.target.value))}
          aria-label="Select year"
        >
          {yearRange.map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </YearSelect>

        <NavButton onClick={goToNextMonth} aria-label="Next month">
          <ChevronRight size={18} />
        </NavButton>
      </NavGroup>

      <ControlsGroup>
        <CountrySelect
          value={country}
          onChange={e => onCountryChange(e.target.value)}
          aria-label="Select country"
        >
          {countries.map(c => (
            <option key={c.countryCode} value={c.countryCode}>
              {c.name}
            </option>
          ))}
        </CountrySelect>

        <SearchInput
          type="text"
          placeholder="Search tasks..."
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          aria-label="Search tasks"
        />

        <ThemeButton onClick={onToggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </ThemeButton>
      </ControlsGroup>
    </Header>
  );
}
