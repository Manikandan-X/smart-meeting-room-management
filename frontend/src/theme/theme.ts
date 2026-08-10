import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3454D1',
      light: '#6C7FE0',
      dark: '#233A94',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00B4A0',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F4F6FB',
      paper: '#FFFFFF',
    },
    success: { main: '#2E9E5B' },
    warning: { main: '#E0A22C' },
    error: { main: '#D64545' },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow:
            '0 1px 2px rgba(16, 24, 40, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            '0 1px 3px rgba(16, 24, 40, 0.08)',
        },
      },
    },
  },
})
