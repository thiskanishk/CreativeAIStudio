import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  ThemeOptions 
} from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Theme context type
interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use the theme context
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};

// Get theme design tokens based on mode
const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode palette
          primary: {
            main: '#1877F2',
            light: '#4791db',
            dark: '#115293',
            contrastText: '#fff',
          },
          secondary: {
            main: '#E74C3C',
            light: '#ec7063',
            dark: '#a13429',
            contrastText: '#fff',
          },
          background: {
            default: '#F5F7FA',
            paper: '#FFFFFF',
          },
        }
      : {
          // Dark mode palette
          primary: {
            main: '#1877F2',
            light: '#4791db',
            dark: '#115293',
            contrastText: '#fff',
          },
          secondary: {
            main: '#E74C3C',
            light: '#ec7063',
            dark: '#a13429',
            contrastText: '#fff',
          },
          background: {
            default: '#121212',
            paper: '#1E1E1E',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
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
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
  },
});

// Theme provider component
const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to get the theme mode from localStorage
  const [mode, setMode] = useState<PaletteMode>('light');

  // Effect to load the theme mode from localStorage on initial render
  useEffect(() => {
    let isMounted = true;
    
    const loadTheme = () => {
      const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;
      if (savedMode && isMounted) {
        setMode(savedMode);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && isMounted) {
        // Use user's system preference as fallback
        setMode('dark');
      }
    };
    
    loadTheme();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle theme function - memoized with useCallback
  const toggleColorMode = useCallback(() => {
    setMode((prevMode: PaletteMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  }, []);

  // Create the theme based on current mode - memoized with useMemo
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    mode,
    toggleColorMode,
  }), [mode, toggleColorMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider; 