import type { Task } from '@calendar/shared';
import styled from '@emotion/styled';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCalendar } from '../../hooks/useCalendar';
import type { Country } from '../../services/holidayService';
import { useAppDispatch, useAppSelector } from '../../store';
import { setQuery } from '../../store/searchSlice';
import { fetchAllTasks, selectFilteredTasks } from '../../store/tasksSlice';
import { CustomSelect } from '../ui/CustomSelect';
import { SearchResults } from './SearchResults';

interface CalendarHeaderProps {
  countries: Country[];
  country: string;
  onCountryChange: (code: string) => void;
  onSelectSearchResult: (task: Task) => void;
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

const SearchInput = styled.input`
  padding: 10px 32px 10px 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  width: 220px;
  outline: none;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surfaceHover};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition:
    background-color 100ms ease,
    color 100ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
const MONTHS = Array.from({ length: 12 }, (_, i) => monthFormatter.format(new Date(2024, i)));

export function CalendarHeader({
  countries,
  country,
  onCountryChange,
  onSelectSearchResult,
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

  const yearRange = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const monthOptions = MONTHS.map((label, value) => ({ value, label }));
  const yearOptions = yearRange.map(y => ({ value: y, label: String(y) }));
  const countryOptions = countries.map(c => ({ value: c.countryCode, label: c.name }));

  const [searchValue, setSearchValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const allFetchedRef = useRef(false);

  const filteredTasks = useAppSelector(state => selectFilteredTasks(state, searchValue));

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Reset highlighted index when search value changes
  useEffect(() => {
    setHighlightedIndex(-1);
    setSelectedTaskId(null);
  }, [searchValue]);

  const isDropdownOpen = searchValue.trim() !== '';

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);

      if (value.trim() && !allFetchedRef.current) {
        dispatch(fetchAllTasks());
        allFetchedRef.current = true;
      }

      if (!value.trim()) {
        allFetchedRef.current = false;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch(setQuery(value));
      }, 300);
    },
    [dispatch]
  );

  const handleResultSelect = useCallback(
    (task: Task) => {
      setSelectedTaskId(task.id);
      onSelectSearchResult(task);
    },
    [onSelectSearchResult]
  );

  const handleClear = useCallback(() => {
    setSearchValue('');
    dispatch(setQuery(''));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    allFetchedRef.current = false;
    setSelectedTaskId(null);
    setHighlightedIndex(-1);
  }, [dispatch]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setSearchValue('');
        dispatch(setQuery(''));
        if (debounceRef.current) clearTimeout(debounceRef.current);
        return;
      }

      if (!isDropdownOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, filteredTasks.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleResultSelect(filteredTasks[highlightedIndex]);
      }
    },
    [dispatch, isDropdownOpen, filteredTasks, highlightedIndex, handleResultSelect]
  );

  return (
    <Header>
      <NavGroup>
        <NavButton onClick={goToPrevMonth} aria-label="Previous month">
          <ChevronLeft size={18} />
        </NavButton>
        <CustomSelect
          value={currentMonth}
          options={monthOptions}
          onChange={setCalendarMonth}
          ariaLabel="Select month"
          size="lg"
          minWidth="130px"
          borderMode="transparent"
        />
        <CustomSelect
          value={currentYear}
          options={yearOptions}
          onChange={setCalendarYear}
          ariaLabel="Select year"
          size="lg"
          minWidth="110px"
          borderMode="transparent"
        />
        <NavButton onClick={goToNextMonth} aria-label="Next month">
          <ChevronRight size={18} />
        </NavButton>
      </NavGroup>

      <ControlsGroup>
        <CustomSelect
          value={country}
          options={countryOptions}
          onChange={onCountryChange}
          ariaLabel="Select country"
          size="md"
          minWidth="220px"
          borderMode="light"
        />
        <SearchWrapper>
          <InputWrapper>
            <SearchInput
              type="text"
              placeholder="Search tasks..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              aria-label="Search tasks"
              aria-expanded={isDropdownOpen}
              aria-controls="search-results-listbox"
              aria-activedescendant={
                highlightedIndex >= 0 ? `search-result-${highlightedIndex}` : undefined
              }
            />
            {isDropdownOpen && (
              <ClearButton onClick={handleClear} aria-label="Clear search">
                <X size={14} />
              </ClearButton>
            )}
          </InputWrapper>
          {isDropdownOpen && (
            <SearchResults
              tasks={filteredTasks}
              selectedTaskId={selectedTaskId}
              highlightedIndex={highlightedIndex}
              onSelect={handleResultSelect}
            />
          )}
        </SearchWrapper>
      </ControlsGroup>
    </Header>
  );
}
