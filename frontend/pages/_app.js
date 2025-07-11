import '../styles/global.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from '../hooks/useTheme';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [authToken, setAuthToken] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load token from localStorage on initial mount
    const token = localStorage.getItem('authToken');
    setAuthToken(token);
    setIsAuthChecked(true);
    
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
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
  }, [router.pathname, authToken, isAuthChecked]);

  // Page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02,
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: [0.4, 0, 0.2, 1],
    duration: 0.4,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <Head>
          <title>Drawing to Animation Studio</title>
          <meta name="description" content="Transform your drawings into magical stories with AI" />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <meta name="theme-color" content="#000000" />
          <link rel="icon" href="/favicon.ico" />
          
          {/* Apple-specific meta tags */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Drawing Studio" />
          
          {/* Preload critical fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        </Head>
        
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-2xl">🎨</span>
          </motion.div>
          <motion.h1
            className="text-2xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Drawing to Animation
          </motion.h1>
          <motion.p
            className="text-neutral-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Preparing your creative studio...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthChecked) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeProvider>
      <Head>
        <title>Drawing to Animation Studio</title>
        <meta name="description" content="Transform your drawings into magical stories with AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Apple-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Drawing Studio" />
        
        {/* Preload critical fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      </Head>
      
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={router.route}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="min-h-screen"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default MyApp;