const ROWS = 6;
const COLS = 7;

export function buildCalendarGrid(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0 = Sunday

  const grid: Date[][] = [];

  for (let row = 0; row < ROWS; row++) {
    const week: Date[] = [];
    for (let col = 0; col < COLS; col++) {
      const dayIndex = row * COLS + col - startOffset;
      week.push(new Date(year, month, 1 + dayIndex));
    }
    grid.push(week);
  }

  return grid;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
