import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import calendarReducer from './calendarSlice';
import searchReducer from './searchSlice';
import tasksReducer from './tasksSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    calendar: calendarReducer,
    search: searchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
