import { css, Global, useTheme } from '@emotion/react';

export function GlobalStyles() {
  const theme = useTheme();

  return (
    <Global
      styles={css`
        html {
          box-sizing: border-box;
          -webkit-text-size-adjust: 100%;
        }

        *,
        *::before,
        *::after {
          box-sizing: inherit;
        }

        body {
          margin: 0;
          min-height: 100vh;
          background-color: ${theme.colors.background};
          font-family: ${theme.font.family};
          color: ${theme.colors.text};
          transition:
            background-color 200ms ease,
            color 200ms ease,
            border-color 200ms ease,
            box-shadow 200ms ease;
        }

        img,
        picture,
        video,
        canvas,
        svg {
          display: block;
          max-width: 100%;
        }

        input,
        button,
        textarea,
        select {
          font: inherit;
        }

        *,
        *::before,
        *::after {
          transition:
            background-color 200ms ease,
            color 200ms ease,
            border-color 200ms ease,
            box-shadow 200ms ease;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            transition: none !important;
            animation: none !important;
          }
        }
      `}
    />
  );
}
