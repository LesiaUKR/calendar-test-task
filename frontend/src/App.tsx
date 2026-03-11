import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'sonner';

import { AppHeader } from './components/AppHeader';
import { Calendar } from './components/Calendar/Calendar';
import { useCountries } from './hooks/useCountries';
import { GlobalStyles } from './styles/GlobalStyles';
import { darkTheme, lightTheme } from './styles/theme';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
`;

export const App = () => {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('calendar-theme') === 'dark';
    } catch {
      return false;
    }
  });

  const { countries, country, setCountry } = useCountries();

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

  useEffect(() => {
    try {
      localStorage.setItem('calendar-theme', isDark ? 'dark' : 'light');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Theme persistence failed', error);
      }
    }
  }, [isDark]);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <Toaster position="top-right" />
      <GlobalStyles />
      <AppHeader isDark={isDark} onToggleTheme={toggleTheme} />
      <Container>
        <Calendar countries={countries} country={country} onCountryChange={setCountry} />
      </Container>
    </ThemeProvider>
  );
};
