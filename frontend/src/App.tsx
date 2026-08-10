import { RouterProvider } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { theme } from '@/theme/theme'
import { AuthProvider } from '@/context/AuthContext'
import { router } from '@/routes/router'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={3500}
      >
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  )
}
