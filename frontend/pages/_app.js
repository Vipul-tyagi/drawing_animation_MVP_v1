import '../styles/global.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [authToken, setAuthToken] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Load token from localStorage on initial mount
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
    setIsAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!isAuthChecked) return; // Wait until auth token is checked

    const publicPaths = ['/login']; // Paths that don't require authentication
    const currentPath = router.pathname;

    if (!publicPaths.includes(currentPath)) {
      if (!authToken) {
        router.push('/login');
      }
    }
  }, [router.pathname, authToken, isAuthChecked]); // Re-run effect when route or token changes

  return <Component {...pageProps} />;
}

export default MyApp;
