import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '../context/AuthContext';
import ThemeContextProvider from '../context/ThemeContext';
import '../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import dynamic from 'next/dynamic';

// Dynamically import ReactQueryDevtools to reduce initial bundle size
const ReactQueryDevtoolsComponent = dynamic(
  () => import('react-query/devtools').then(module => module.ReactQueryDevtools),
  { ssr: false }
);

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000, // 1 minute stale time to reduce network requests
    },
  },
});

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeContextProvider>
          <AuthProvider>
            <Component {...pageProps} />
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </AuthProvider>
        </ThemeContextProvider>
        <ReactQueryDevtoolsComponent initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
} 