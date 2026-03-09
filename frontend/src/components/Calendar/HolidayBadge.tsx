import styled from '@emotion/styled';

import type { PublicHoliday } from '../../services/holidayService';

interface HolidayBadgeProps {
  holiday: PublicHoliday;
}

const Badge = styled.div`
  background: ${({ theme }) => theme.colors.holidayBg};
  border: 1px solid ${({ theme }) => theme.colors.holidayBorder};
  color: ${({ theme }) => theme.colors.holidayText};
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.02em;
`;

export function HolidayBadge({ holiday }: HolidayBadgeProps) {
  return <Badge title={holiday.name}>{holiday.name}</Badge>;
}
