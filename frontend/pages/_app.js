
import '../styles/global.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { ThemeProvider } from '../hooks/useTheme';
import SmartErrorBoundary from '../components/SmartErrorBoundary';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [authToken, setAuthToken] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
    setIsAuthChecked(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthChecked) return;

    const publicPaths = ['/login'];
    const currentPath = router.pathname;

    if (!publicPaths.includes(currentPath)) {
      if (!authToken) {
        router.push('/login');
      }
    }
  }, [router.pathname, authToken, isAuthChecked]);

  if (isLoading) {
    return (
      <div>
        <Head>
          <title>Drawing to Animation Studio</title>
        </Head>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthChecked) {
    return null;
  }

  return (
    <ThemeProvider>
      <SmartErrorBoundary>
        <Head>
          <title>Drawing to Animation Studio</title>
        </Head>
        <Component {...pageProps} />
      </SmartErrorBoundary>
    </ThemeProvider>
  );
}

export default MyApp;
