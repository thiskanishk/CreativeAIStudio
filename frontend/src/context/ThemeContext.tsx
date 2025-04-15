import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme, PaletteMode } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Define theme settings
const lightTheme = {
  primary: {
    main: '#6366f1', // primary-500 from Tailwind
    light: '#818cf8',
    dark: '#4f46e5',
  },
  secondary: {
    main: '#64748b', // secondary-500 from Tailwind
    light: '#94a3b8',
    dark: '#475569',
  },
  success: {
    main: '#10b981', // success-500 from Tailwind
  },
  error: {
    main: '#ef4444', // error-500 from Tailwind
  },
  background: {
    default: '#f9fafb', // gray-50 from Tailwind
    paper: '#ffffff',
  },
  text: {
    primary: '#1f2937', // gray-800 from Tailwind
    secondary: '#4b5563', // gray-600 from Tailwind
  }
};

const darkTheme = {
  primary: {
    main: '#818cf8', // Lighter shade for dark mode
    light: '#a5b4fc',
    dark: '#4f46e5',
  },
  secondary: {
    main: '#94a3b8', // secondary-400 from Tailwind
    light: '#cbd5e1',
    dark: '#64748b',
  },
  success: {
    main: '#34d399', // success-400 from Tailwind
  },
  error: {
    main: '#f87171', // error-400 from Tailwind
  },
  background: {
    default: '#111827', // gray-900 from Tailwind
    paper: '#1f2937', // gray-800 from Tailwind
  },
  text: {
    primary: '#f9fafb', // gray-50 from Tailwind
    secondary: '#e5e7eb', // gray-200 from Tailwind
  }
};

// Theme context
type ThemeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
  theme: createTheme(),
});

// Hook to use the theme context
export const useThemeContext = () => useContext(ThemeContext);

// Theme provider component
export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to get the theme mode from localStorage
  const [mode, setMode] = useState<PaletteMode>('light');

  // Effect to load the theme mode from localStorage on initial render
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;
    if (savedMode) {
      setMode(savedMode);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use user's system preference as fallback
      setMode('dark');
    }
  }, []);

  // Toggle theme function
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Create theme based on the current mode
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light' ? lightTheme : darkTheme),
        },
        typography: {
          fontFamily: '"Inter", sans-serif',
          h1: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
          },
          h2: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
          },
          h3: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
          },
          h4: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
          },
          h5: {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
          },
          h6: {
            fontFamily: '"Poppins", sans-serif',
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
                borderRadius: '0.375rem',
                fontWeight: 500,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' 
                  ? '0 1px 3px rgba(0,0,0,0.1)' 
                  : '0 1px 3px rgba(0,0,0,0.3)',
                backgroundImage: 'none',
              },
            },
          },
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarWidth: 'thin',
                '&::-webkit-scrollbar': {
                  width: '0.4rem',
                  height: '0.4rem',
                },
                '&::-webkit-scrollbar-track': {
                  background: mode === 'light' ? '#f1f1f1' : '#374151',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: mode === 'light' ? '#888' : '#6B7280',
                  borderRadius: '0.25rem',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: mode === 'light' ? '#555' : '#9CA3AF',
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode, theme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider; 