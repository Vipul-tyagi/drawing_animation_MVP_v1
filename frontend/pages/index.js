import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { Upload, BookOpen, LogOut, Sparkles, User, Menu, X, HelpCircle, Heart } from 'lucide-react';

import JoyfulUploadForm from '../components/JoyfulUploadForm';
import MagicalOutputDisplay from '../components/MagicalOutputDisplay';
import MagicalLoadingSpinner from '../components/MagicalLoadingSpinner';
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
          <JoyfulUploadForm
            onGenerateClick={handleGenerateClick}
            setError={setError}
          />
        );
      case 'output':
        return (
          <MagicalOutputDisplay
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
        <title>🎨 Magical Drawing Studio - Create Amazing Stories! ✨</title>
        <meta name="description" content="Transform your child's drawings into magical bedtime stories with AI! Fun, safe, and educational for the whole family." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300" {...swipeHandlers}>
        {/* Navigation Header */}
        <motion.header
          className="sticky top-0 z-50 glass-surface border-b-4 border-primary/20"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-magical"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-display font-bold rainbow-text">
                    Magical Drawing Studio
                  </h1>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                    Where drawings come to life! ✨
                  </p>
                </div>
              </motion.div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <motion.button
                  onClick={() => router.push('/my-creations')}
                  className="btn-ghost flex items-center gap-2 font-bold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BookOpen size={18} />
                  📚 My Stories
                </motion.button>
                
                <motion.button
                  onClick={() => setShowHelp(true)}
                  className="btn-ghost flex items-center gap-2 font-bold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <HelpCircle size={18} />
                  🆘 Help
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
                  className="btn-ghost flex items-center gap-2 text-error hover:bg-error/10 font-bold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut size={18} />
                  👋 Bye!
                </motion.button>
              </nav>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden p-3 rounded-2xl glass-surface border-2 border-primary/30"
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
                className="md:hidden glass-surface border-t-4 border-primary/20"
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
                    className="w-full btn-ghost flex items-center gap-3 justify-start font-bold text-lg"
                  >
                    <BookOpen size={18} />
                    📚 My Stories
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowHelp(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full btn-ghost flex items-center gap-3 justify-start font-bold text-lg"
                  >
                    <HelpCircle size={18} />
                    🆘 Help
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
                    <span className="text-lg font-bold">🎨 Theme</span>
                    <ThemeToggle />
                  </div>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full btn-ghost flex items-center gap-3 justify-start text-error hover:bg-error/10 font-bold text-lg"
                  >
                    <LogOut size={18} />
                    👋 Bye!
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>

        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Floating magical elements */}
            <div className="absolute inset-0 pointer-events-none">
              {['✨', '🌟', '💫', '⭐', '🎨', '🌈', '🦄', '🧚‍♀️'].map((emoji, i) => (
                <motion.div
                  key={i}
                  className="absolute text-4xl"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    rotate: [0, 180, 360],
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.8, 0.3]
                  }}
                  transition={{
                    duration: 4,
                    delay: i * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>

            <motion.h1
              className="text-6xl md:text-8xl font-display font-bold mb-6 rainbow-text relative z-10"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: '200% 100%' }}
            >
              🎨 Bring Your Drawings to Life! ✨
            </motion.h1>
            <motion.p
              className="text-2xl font-bold text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              🌟 Transform your child's drawings into magical bedtime stories with AI! 
              Upload your artwork and watch the magic happen! 🚀
            </motion.p>
            
            <motion.div
              className="mt-6 flex justify-center gap-4 flex-wrap relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {['Safe for Kids', 'AI Powered', 'Instant Magic', 'Family Fun'].map((feature, i) => (
                <motion.div
                  key={feature}
                  className="px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border-2 border-primary/30 font-bold text-primary"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                >
                  ✨ {feature}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            className="glass-card mb-8 max-w-4xl mx-auto border-4 border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute left-6 right-6 h-0.5 bg-neutral-200 dark:bg-neutral-700 top-6 -z-10">
                <motion.div
                  className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full shadow-magical"
                  initial={{ width: '0%' }}
                  animate={{ width: currentPhase === 'output' ? '100%' : '0%' }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>

              <Step
                icon={<Upload size={24} />}
                title="🎨 Upload & Describe"
                number={1}
                isActive={currentPhase === 'input'}
                isCompleted={currentPhase === 'output'}
                onClick={() => currentPhase === 'output' && resetApp()}
              />
              
              <Step
                icon={<BookOpen size={24} />}
                title="📖 Your Magical Story"
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
                  className="mb-6 p-6 glass-surface border-4 border-error/30 rounded-3xl"
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-error/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-error text-lg">😅</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-error mb-2 text-lg">Oops! Something went wrong! 😅</h4>
                      <p className="text-base font-medium text-neutral-600 dark:text-neutral-400">{error}</p>
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
                  className="glass-card border-4 border-primary/20"
                >
                  <MagicalLoadingSpinner message={processingMessage} progress={progress} />
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
            className="text-center mt-16 text-neutral-500 dark:text-neutral-400 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 glass-surface rounded-full border-2 border-primary/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Heart className="w-5 h-5 text-red-500" />
              <p className="font-bold text-lg">
                &copy; {new Date().getFullYear()} Magical Drawing Studio. 
                Made with 💖 and AI magic for amazing families! ✨
              </p>
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
          </motion.footer>
        </div>

        {/* Onboarding Flow */}
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />

        {/* Contextual Help */}
        <ContextualTips currentStep={currentPhase} />
        
        {/* Help Center */}
        <HelpCenter isOpen={showHelp} onClose={() => setShowHelp(false)} />
        
        {/* Onboarding Flow */}
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />

        {/* Background Ambient Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [-50, 50, -50],
              y: [-50, 50, -50]
            }}
            transition={{
              duration: 6,
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