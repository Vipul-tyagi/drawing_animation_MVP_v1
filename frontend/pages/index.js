import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { Upload, BookOpen, LogOut, Sparkles, User, Menu, X, HelpCircle } from 'lucide-react';

import EnhancedUploadForm from '../components/EnhancedUploadForm';
import CombinedOutputDisplay from '../components/CombinedOutputDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import ThemeToggle from '../components/ThemeToggle';
import OnboardingFlow from '../components/OnboardingFlow';
import SmartErrorBoundary from '../components/SmartErrorBoundary';
import { NotificationProvider } from '../components/SmartNotifications';
import { ContextualTips, HelpCenter } from '../components/ContextualHelp';
import { useTheme } from '../hooks/useTheme';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { usePerformanceMonitor } from '../components/PerformanceMonitor';

const Step = ({ icon, title, number, isActive, isCompleted, onClick }) => (
  <motion.div
    className={`
      flex items-center transition-all duration-300 cursor-pointer
      ${isActive ? 'scale-105' : ''}
    `}
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <motion.div
      className={`
        w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg
        transition-all duration-300 relative overflow-hidden
        ${isActive 
          ? 'bg-primary text-white shadow-lg shadow-primary/30' 
          : isCompleted 
            ? 'bg-success text-white shadow-lg shadow-success/30' 
            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
        }
      `}
      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {isCompleted ? (
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </motion.svg>
      ) : (
        icon
      )}
      
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
    
    <div className="ml-4">
      <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Step {number}
      </div>
      <div className={`
        text-base font-semibold transition-colors duration-300
        ${isActive 
          ? 'text-primary' 
          : 'text-neutral-700 dark:text-neutral-300'
        }
      `}>
        {title}
      </div>
    </div>
  </motion.div>
);

export default function Home() {
  const [currentPhase, setCurrentPhase] = useState('input');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [storyResult, setStoryResult] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingMessage, setProcessingMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const router = useRouter();
  const { isDark } = useTheme();
  const haptic = useHapticFeedback();
  const { markStart, markEnd, reportCustomMetric } = usePerformanceMonitor();

  useEffect(() => {
    markStart('page_load');
    return () => {
      markEnd('page_load');
    };
  }, []);

  // Swipe gestures for mobile navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentPhase === 'input' && uploadedFileData) {
        // Could navigate to next step if implemented
      }
    },
    onSwipedRight: () => {
      if (currentPhase === 'output') {
        resetApp();
      }
    },
    trackMouse: false,
    delta: 50,
  });

  const handleLogout = () => {
    haptic.light();
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const simulateProgress = (duration = 30000) => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 3;
      });
    }, duration / 30);
    
    return () => clearInterval(interval);
  };

  const handleGenerateClick = async (file, story) => {
    setLoading(true);
    setError(null);
    haptic.medium();

    const clearProgress = simulateProgress();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('story', story);

    try {
      const authToken = localStorage.getItem('authToken');
      
      setProcessingMessage('Uploading your drawing...');
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
        setProcessingMessage('Generating your bedtime story...');
        const creationResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/creations/${uploadData.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const creationData = await creationResponse.json();

        if (creationData.success) {
          const fetchedCreation = creationData.creation;
          setUploadedImage({ id: fetchedCreation.creationId, url: fetchedCreation.originalImageUrl });
          setUploadedFileData(fetchedCreation);

          const storyResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/story`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({
              imageId: fetchedCreation.creationId,
              drawingDescription: fetchedCreation.userPromptText,
              s3Key: fetchedCreation.s3Key,
            }),
          });

          const storyData = await storyResponse.json();

          if (storyData.success) {
            setStoryResult(storyData.story);

            setProcessingMessage('Enhancing your drawing with AI magic...');
            const enhancementPayload = {
              imageId: fetchedCreation.creationId,
              enhancementType: 'stylize',
              prompt: storyData.story,
            };
            const enhancementResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enhance`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              },
              body: JSON.stringify(enhancementPayload),
            });
            const enhancementData = await enhancementResponse.json();

            if (enhancementData.success) {
              const finalCreationResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/creations/${fetchedCreation.creationId}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
              });
              const finalCreationData = await finalCreationResponse.json();

              if (finalCreationData.success) {
                setUploadedFileData(finalCreationData.creation);
                setProgress(100);
                setTimeout(() => {
                  setCurrentPhase('output');
                  haptic.success();
                }, 500);
              } else {
                setError(finalCreationData.error || 'Failed to re-fetch final creation details.');
                haptic.error();
              }
            } else {
              setError(enhancementData.error || 'Failed to enhance image.');
              haptic.error();
            }
          } else {
            setError(storyData.error || 'Failed to generate story.');
            haptic.error();
          }
        } else {
          setError(creationData.error || 'Failed to fetch creation details.');
          haptic.error();
        }
      } else {
        setError(uploadData.error || 'Upload failed');
        haptic.error();
      }
    } catch (err) {
      console.error('Error during processing:', err);
      setError('An error occurred during processing: ' + err.message);
      haptic.error();
    } finally {
      clearProgress();
      setLoading(false);
      setProcessingMessage('');
      setProgress(0);
    }
  };

  const resetApp = () => {
    haptic.light();
    setCurrentPhase('input');
    setUploadedImage(null);
    setUploadedFileData(null);
    setStoryResult(null);
    setEnhancedImage(null);
    setError(null);
    setProcessingMessage('');
    setProgress(0);
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'input':
        return (
          <EnhancedUploadForm
            onGenerateClick={handleGenerateClick}
            setError={setError}
          />
        );
      case 'output':
        return (
          <CombinedOutputDisplay
            creation={uploadedFileData}
            resetApp={resetApp}
          />
        );
      default:
        return null;
    }
  };

  return (
    <NotificationProvider>
      <SmartErrorBoundary>
      <Head>
        <title>Drawing to Animation Studio</title>
        <meta name="description" content="Transform your drawings into magical stories with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300" {...swipeHandlers}>
        {/* Navigation Header */}
        <motion.header
          className="sticky top-0 z-50 glass-surface border-b border-neutral-200/50 dark:border-neutral-700/50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  Drawing Studio
                </h1>
              </motion.div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <motion.button
                  onClick={() => router.push('/my-creations')}
                  className="btn-ghost flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BookOpen size={18} />
                  My Creations
                </motion.button>
                
                <motion.button
                  onClick={() => setShowHelp(true)}
                  className="btn-ghost flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <HelpCircle size={18} />
                  Help
                </motion.button>
                
                <ThemeToggle />
                
                <motion.button
                  onClick={handleLogout}
                  className="btn-ghost flex items-center gap-2 text-error hover:bg-error/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut size={18} />
                  Logout
                </motion.button>
              </nav>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden p-2 rounded-xl glass-surface"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileTap={{ scale: 0.95 }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="md:hidden glass-surface border-t border-neutral-200/50 dark:border-neutral-700/50"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="container mx-auto px-4 py-4 space-y-3">
                  <button
                    onClick={() => {
                      router.push('/my-creations');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full btn-ghost flex items-center gap-3 justify-start"
                  >
                    <BookOpen size={18} />
                    My Creations
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowHelp(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full btn-ghost flex items-center gap-3 justify-start"
                  >
                    <HelpCircle size={18} />
                    Help
                  </button>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full btn-ghost flex items-center gap-3 justify-start text-error hover:bg-error/10"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.h1
              className="text-display mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: '200% 100%' }}
            >
              Bring Your Drawings to Life!
            </motion.h1>
            <motion.p
              className="text-body text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Transform your static drawings into captivating stories with the power of AI. 
              Upload your artwork and watch as we create a magical bedtime story just for you.
            </motion.p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            className="glass-card mb-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute left-6 right-6 h-0.5 bg-neutral-200 dark:bg-neutral-700 top-6 -z-10">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: currentPhase === 'output' ? '100%' : '0%' }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>

              <Step
                icon={<Upload size={24} />}
                title="Upload & Describe"
                number={1}
                isActive={currentPhase === 'input'}
                isCompleted={currentPhase === 'output'}
                onClick={() => currentPhase === 'output' && resetApp()}
              />
              
              <Step
                icon={<BookOpen size={24} />}
                title="Your Creation"
                number={2}
                isActive={currentPhase === 'output'}
                isCompleted={false}
                onClick={() => {}}
              />
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.main
            className="max-w-7xl mx-auto"
            layout
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-6 p-4 glass-surface border border-error/20 rounded-2xl"
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-error/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-error text-sm">!</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-error mb-1">Oops! Something went wrong</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card"
                >
                  <LoadingSpinner message={processingMessage} progress={progress} />
                </motion.div>
              ) : (
                <motion.div
                  key={currentPhase}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                  {renderPhaseContent()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>

          {/* Footer */}
          <motion.footer
            className="text-center mt-16 text-neutral-500 dark:text-neutral-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <p className="text-caption">
              &copy; {new Date().getFullYear()} Drawing to Animation Studio. 
              Made with ❤️ and AI magic.
            </p>
          </motion.footer>
        </div>

        {/* Contextual Help */}
        <ContextualTips currentStep={currentPhase} />
        
        {/* Help Center */}
        <HelpCenter isOpen={showHelp} onClose={() => setShowHelp(false)} />
        
        {/* Onboarding Flow */}
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />

        {/* Background Ambient Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
      </SmartErrorBoundary>
    </NotificationProvider>
  );
}