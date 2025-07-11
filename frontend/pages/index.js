import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, BookOpen, LogOut, Sparkles, HelpCircle, Menu, X } from 'lucide-react';

import UploadForm from '../components/UploadForm';
import CombinedOutputDisplay from '../components/CombinedOutputDisplay';
import LoadingSpinner from '../components/LoadingSpinner';

const Step = ({ icon, title, number, isActive, isCompleted }) => (
  <div className="flex items-center">
    <div
      className={`
        w-10 h-10 rounded-full flex items-center justify-center font-semibold
        ${isActive 
          ? 'bg-primary text-white' 
          : isCompleted 
            ? 'bg-success text-white' 
            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
        }
      `}
    >
      {isCompleted ? '✓' : icon}
    </div>
    <div className="ml-3">
      <div className="text-xs font-medium text-neutral-500">Step {number}</div>
      <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{title}</div>
    </div>
  </div>
);

export default function Home() {
  const [currentPhase, setCurrentPhase] = useState('input');
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingMessage, setProcessingMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const router = useRouter();

  const handleLogout = () => {
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
            'Authorization': `Bearer ${authToken}`,
          },
        });
        const creationData = await creationResponse.json();

        if (creationData.success) {
          const fetchedCreation = creationData.creation;
          setUploadedFileData(fetchedCreation);

          const storyResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/story`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              imageId: fetchedCreation.creationId,
              drawingDescription: fetchedCreation.userPromptText,
              s3Key: fetchedCreation.s3Key,
            }),
          });

          const storyData = await storyResponse.json();

          if (storyData.success) {
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
                'Authorization': `Bearer ${authToken}`,
              },
              body: JSON.stringify(enhancementPayload),
            });
            const enhancementData = await enhancementResponse.json();

            if (enhancementData.success) {
              const finalCreationResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/creations/${fetchedCreation.creationId}`, {
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                },
              });
              const finalCreationData = await finalCreationResponse.json();

              if (finalCreationData.success) {
                setUploadedFileData(finalCreationData.creation);
                setProgress(100);
                setTimeout(() => {
                  setCurrentPhase('output');
                }, 500);
              } else {
                setError(finalCreationData.error || 'Failed to re-fetch final creation details.');
              }
            } else {
              setError(enhancementData.error || 'Failed to enhance image.');
            }
          } else {
            setError(storyData.error || 'Failed to generate story.');
          }
        } else {
          setError(creationData.error || 'Failed to fetch creation details.');
        }
      } else {
        setError(uploadData.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Error during processing:', err);
      setError('An error occurred during processing: ' + err.message);
    } finally {
      clearProgress();
      setLoading(false);
      setProcessingMessage('');
      setProgress(0);
    }
  };

  const resetApp = () => {
    setCurrentPhase('input');
    setUploadedFileData(null);
    setError(null);
    setProcessingMessage('');
    setProgress(0);
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'input':
        return (
          <UploadForm
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Head>
        <title>Drawing to Animation Studio</title>
        <meta name="description" content="Transform your drawings into magical stories with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-surface border-b border-neutral-200 dark:border-neutral-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                  Drawing Studio
                </h1>
                <p className="text-xs text-neutral-500">
                  Where drawings come to life! ✨
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={() => router.push('/my-creations')}
                className="btn-ghost flex items-center gap-2"
              >
                <BookOpen size={16} />
                My Stories
              </button>
              
              <button
                onClick={handleLogout}
                className="btn-ghost flex items-center gap-2 text-error"
              >
                <LogOut size={16} />
                Logout
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg glass-surface"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                className="md:hidden mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      router.push('/my-creations');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full btn-ghost flex items-center gap-2 justify-start"
                  >
                    <BookOpen size={16} />
                    My Stories
                  </button>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full btn-ghost flex items-center gap-2 justify-start text-error"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-display mb-4">
            Bring Your Drawings to Life! 🎨
          </h1>
          <p className="text-body text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Transform your child's drawings into magical bedtime stories with AI! 
            Upload your artwork and watch the magic happen! ✨
          </p>
        </div>

        {/* Progress Steps */}
        <div className="glass-card mb-8 max-w-2xl mx-auto">
          <div className="flex justify-between items-center">
            <Step
              icon={<Upload size={20} />}
              title="Upload & Describe"
              number={1}
              isActive={currentPhase === 'input'}
              isCompleted={currentPhase === 'output'}
            />
            
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700 mx-4">
              <div 
                className={`h-full bg-primary transition-all duration-500 ${
                  currentPhase === 'output' ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            
            <Step
              icon={<BookOpen size={20} />}
              title="Your Creation"
              number={2}
              isActive={currentPhase === 'output'}
              isCompleted={false}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto">
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-6 p-4 glass-surface border-l-4 border-error rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-error text-lg">⚠️</span>
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card"
              >
                <LoadingSpinner message={processingMessage} progress={progress} />
              </motion.div>
            ) : (
              <motion.div
                key={currentPhase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderPhaseContent()}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-neutral-500 dark:text-neutral-400">
          <p>&copy; {new Date().getFullYear()} Drawing Studio. Made with ❤️ for families!</p>
        </footer>
      </div>
    </div>
  );
}