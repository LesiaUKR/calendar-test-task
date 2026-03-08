import { createSlice } from '@reduxjs/toolkit';

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
  },
});

export const { prevMonth, nextMonth } = calendarSlice.actions;
export default calendarSlice.reducer;
