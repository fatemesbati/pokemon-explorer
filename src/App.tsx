import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import PokemonList from './components/PokemonList/PokemonList';
import PokemonDetail from './components/PokemonDetail/PokemonDetail';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Create custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#EE1515',
      light: '#FF6B6B',
      dark: '#CC0000',
    },
    secondary: {
      main: '#3B4CCA',
      light: '#6C7FE8',
      dark: '#2A3A9A',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PokemonList />} />
              <Route path="/pokemon/:id" element={<PokemonDetail />} />
              <Route path="*" element={<PokemonList />} />
            </Routes>
          </BrowserRouter>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
