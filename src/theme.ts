import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#e65100' },
    secondary: { main: '#6d4c41' },
    background: { default: '#fffaf5' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Roboto", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { elevation: 0 } },
  },
})
