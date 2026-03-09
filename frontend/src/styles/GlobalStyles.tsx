import { css, Global, useTheme } from '@emotion/react';

export function GlobalStyles() {
  const theme = useTheme();

  return (
    <Global
      styles={css`
        body {
          margin: 0;
          background: ${theme.colors.background};
          font-family: ${theme.font.family};
          color: ${theme.colors.text};
          transition: background 0.2s;
        }
      `}
    />
  );
}
