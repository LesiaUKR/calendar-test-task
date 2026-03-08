import styled from '@emotion/styled';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.font.family};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.font.size.xl};
`;

export const App = () => {
  return (
    <Container>
      <Title>Calendar</Title>
    </Container>
  );
};
