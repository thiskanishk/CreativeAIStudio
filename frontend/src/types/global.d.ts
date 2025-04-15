import { ReactNode } from 'react';

// Ensure MUI theme extensions are properly typed
declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }

  interface PaletteColor {
    lighter?: string;
    darker?: string;
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
  }
}

// For Tailwind CSS classes
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

// For the ThemeContext
interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}

// Extend Next.js Image props to allow for more styling control
declare module 'next/image' {
  export interface ImageProps {
    // Add any custom extensions here if needed
  }
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;
    NEXT_PUBLIC_FACEBOOK_APP_ID: string;
  }
} 