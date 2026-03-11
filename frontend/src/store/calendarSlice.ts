import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const now = new Date();

export interface CalendarState {
  currentYear: number;
  currentMonth: number; // 0-indexed (0 = January)
}

const initialState: CalendarState = {
  currentYear: now.getFullYear(),
  currentMonth: now.getMonth(),
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    prevMonth(state) {
      if (state.currentMonth === 0) {
        state.currentMonth = 11;
        state.currentYear -= 1;
      } else {
        state.currentMonth -= 1;
      }
    },
    nextMonth(state) {
      if (state.currentMonth === 11) {
        state.currentMonth = 0;
        state.currentYear += 1;
      } else {
        state.currentMonth += 1;
      }
    },
    setMonth(state, action: PayloadAction<number>) {
      state.currentMonth = action.payload;
    },
    setYear(state, action: PayloadAction<number>) {
      state.currentYear = action.payload;
    },
    setDate(state, action: PayloadAction<{ year: number; month: number }>) {
      state.currentYear = action.payload.year;
      state.currentMonth = action.payload.month;
    },
  },
});

export const { prevMonth, nextMonth, setMonth, setYear, setDate } = calendarSlice.actions;
export default calendarSlice.reducer;
