import styled from '@emotion/styled';

import { Calendar } from './components/Calendar/Calendar';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.font.family};
`;

export const App = () => {
  return (
    <Container>
      <Calendar />
    </Container>
  );
};
