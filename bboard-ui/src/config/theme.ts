import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#163d32', contrastText: '#f8faf8' },
    secondary: { main: '#5b6f65' },
    success: { main: '#26745b' },
    error: { main: '#a43f3f' },
    background: { default: '#f4f1e9', paper: '#fffdf8' },
    text: { primary: '#17211d', secondary: '#52605a' },
    divider: '#d9ddd8',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 650, letterSpacing: '-0.045em' },
    h2: { fontWeight: 650, letterSpacing: '-0.035em' },
    h3: { fontWeight: 650, letterSpacing: '-0.025em' },
    button: { fontWeight: 650, textTransform: 'none', letterSpacing: '-0.01em' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { minHeight: 44, borderRadius: 10, boxShadow: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: { root: { boxShadow: 'none', border: '1px solid #d9ddd8' } },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '::selection': { backgroundColor: '#cfe6da', color: '#17211d' },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
        },
      },
    },
  },
});
