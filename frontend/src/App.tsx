import { ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

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
  const [isDark, setIsDark] = useState(false);
  const { countries, country, setCountry } = useCountries();

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <GlobalStyles />
      <Container>
        <Calendar
          isDark={isDark}
          onToggleTheme={toggleTheme}
          countries={countries}
          country={country}
          onCountryChange={setCountry}
        />
      </Container>
    </ThemeProvider>
  );
};
