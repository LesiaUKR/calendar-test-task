import type { Task } from '@calendar/shared';
import styled from '@emotion/styled';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  onSelectSearchResult: (task: Task, dateKey: string) => void;
}

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  row-gap: ${({ theme }) => theme.spacing.sm};
`;

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-shrink: 0;
  flex-wrap: nowrap;
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
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

const TodayButton = styled.button<{ isActive: boolean }>`
  height: 36px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, isActive }) =>
    isActive ? `${theme.colors.accent}14` : theme.colors.background};
  border: 1px solid
    ${({ theme, isActive }) => (isActive ? `${theme.colors.accent}55` : theme.colors.borderLight)};
  border-radius: 10px;
  color: ${({ theme, isActive }) => (isActive ? theme.colors.accent : theme.colors.textSecondary)};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ isActive }) => (isActive ? 700 : 600)};
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;

  &:hover {
    background: ${({ theme, isActive }) =>
      isActive ? `${theme.colors.accent}24` : theme.colors.surfaceHover};
  }

  &:focus-visible {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
    outline: none;
  }
`;

const SearchInput = styled.input`
  padding: 10px 14px 10px 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.md};
  width: 100%;
  outline: none;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.borderLight};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}33;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 180px;
  min-width: 100px;
  flex-shrink: 1;
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

  const [yearBounds, setYearBounds] = useState(() => ({
    start: currentYear - 10,
    end: currentYear + 10,
  }));
  const isAdjustingYearsRef = useRef(false);

  const yearRange = Array.from(
    { length: yearBounds.end - yearBounds.start + 1 },
    (_, i) => yearBounds.start + i
  );

  const monthOptions = MONTHS.map((label, value) => ({ value, label }));
  const yearOptions = yearRange.map(y => ({ value: y, label: String(y) }));
  const countryOptions = countries.map(c => ({ value: c.countryCode, label: c.name }));

  const allFetchedRef = useRef(false);
  const searchAreaRef = useRef<HTMLDivElement>(null);

  const query = useAppSelector(state => state.search.query);
  const filteredTasks = useAppSelector(state => selectFilteredTasks(state, query));
  const sortedFilteredTasks = useMemo(
    () => [...filteredTasks].sort((a, b) => b.date.localeCompare(a.date)),
    [filteredTasks]
  );

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const isDropdownOpen = query.trim() !== '';

  const now = new Date();
  const isTodayMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth();

  const handleYearMenuScroll = useCallback((event: React.UIEvent<HTMLUListElement>) => {
    if (isAdjustingYearsRef.current) return;

    const menu = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = menu;
    const threshold = 24;

    const nearBottom = scrollHeight - (scrollTop + clientHeight) <= threshold;
    const nearTop = scrollTop <= threshold;

    if (nearBottom) {
      isAdjustingYearsRef.current = true;
      setYearBounds(prev => ({ ...prev, end: prev.end + 10 }));
      requestAnimationFrame(() => {
        isAdjustingYearsRef.current = false;
      });
      return;
    }

    if (nearTop) {
      isAdjustingYearsRef.current = true;
      const prevHeight = scrollHeight;
      setYearBounds(prev => ({ start: prev.start - 10, end: prev.end }));
      requestAnimationFrame(() => {
        const nextHeight = menu.scrollHeight;
        menu.scrollTop += nextHeight - prevHeight;
        isAdjustingYearsRef.current = false;
      });
    }
  }, []);

  const handleYearMenuWheel = useCallback((event: React.WheelEvent<HTMLUListElement>) => {
    if (isAdjustingYearsRef.current) return;

    const menu = event.currentTarget;
    const isScrollingUp = event.deltaY < 0;
    const threshold = 2;

    if (isScrollingUp && menu.scrollTop <= threshold) {
      isAdjustingYearsRef.current = true;
      const prevHeight = menu.scrollHeight;

      setYearBounds(prev => ({ start: prev.start - 10, end: prev.end }));

      requestAnimationFrame(() => {
        const nextHeight = menu.scrollHeight;
        menu.scrollTop += nextHeight - prevHeight;
        isAdjustingYearsRef.current = false;
      });
    }
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      dispatch(setQuery(value));

      if (value.trim() && !allFetchedRef.current) {
        dispatch(fetchAllTasks());
        allFetchedRef.current = true;
      }

      if (!value.trim()) {
        allFetchedRef.current = false;
      }
    },
    [dispatch]
  );

  const handleResultSelect = useCallback(
    (task: Task) => {
      setSelectedTaskId(task.id);
      onSelectSearchResult(task, task.date);
    },
    [onSelectSearchResult]
  );

  const handleClear = useCallback(() => {
    dispatch(setQuery(''));
    allFetchedRef.current = false;
    setSelectedTaskId(null);
    setHighlightedIndex(-1);
  }, [dispatch]);

  // Reset highlighted index when query changes
  useEffect(() => {
    setHighlightedIndex(-1);
    setSelectedTaskId(null);
  }, [query]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleDocumentPointerDown = (event: MouseEvent) => {
      if (!searchAreaRef.current?.contains(event.target as Node)) {
        handleClear();
      }
    };

    const handleWindowBlur = () => {
      handleClear();
    };

    document.addEventListener('mousedown', handleDocumentPointerDown);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isDropdownOpen, handleClear]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCalendarYear(now.getFullYear());
    setCalendarMonth(now.getMonth());
  }, [setCalendarMonth, setCalendarYear]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        dispatch(setQuery(''));
        return;
      }

      if (!isDropdownOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, sortedFilteredTasks.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleResultSelect(sortedFilteredTasks[highlightedIndex]);
      }
    },
    [dispatch, isDropdownOpen, sortedFilteredTasks, highlightedIndex, handleResultSelect]
  );

  return (
    <Header>
      <NavGroup>
        <NavButton onClick={goToPrevMonth} aria-label="Previous month">
          <ChevronLeft size={18} />
        </NavButton>
        <TodayButton isActive={!isTodayMonth} onClick={goToToday} aria-label="Go to current month">
          Today
        </TodayButton>
        <CustomSelect
          value={currentMonth}
          options={monthOptions}
          onChange={setCalendarMonth}
          ariaLabel="Select month"
          size="lg"
          minWidth="130px"
          width="170px"
          borderMode="transparent"
        />
        <CustomSelect
          value={currentYear}
          options={yearOptions}
          onChange={setCalendarYear}
          onMenuScroll={handleYearMenuScroll}
          onMenuWheel={handleYearMenuWheel}
          ariaLabel="Select year"
          size="lg"
          minWidth="110px"
          width="110px"
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
          width="220px"
          borderMode="light"
        />
        <SearchWrapper ref={searchAreaRef}>
          <InputWrapper>
            <SearchInput
              type="text"
              placeholder="Search tasks..."
              value={query}
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
              tasks={sortedFilteredTasks}
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
