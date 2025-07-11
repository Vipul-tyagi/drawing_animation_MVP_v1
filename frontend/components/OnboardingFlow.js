import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Upload, Sparkles, BookOpen, Download, X } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

const OnboardingStep = ({ step, isActive, onNext, onPrev, onSkip }) => {
  const haptic = useHapticFeedback();

  const steps = [
    {
      title: "Welcome to Drawing Studio",
      subtitle: "Transform your drawings into magical stories",
      content: "Upload any drawing and watch as AI brings it to life with enhanced visuals and personalized bedtime stories.",
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      visual: (
        <div className="relative w-64 h-64 mx-auto">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-4 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: "Upload Your Drawing",
      subtitle: "Any drawing works - from simple sketches to detailed artwork",
      content: "Take a photo or upload an image. Our AI works best with clear, well-lit drawings on plain backgrounds.",
      icon: <Upload className="w-12 h-12 text-primary" />,
      visual: (
        <div className="space-y-4">
          <motion.div
            className="w-48 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl border-2 border-dashed border-primary/50 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Upload className="w-8 h-8 text-primary/70" />
          </motion.div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      )
    },
    {
      title: "AI Enhancement Magic",
      subtitle: "Watch your drawing transform into photorealistic art",
      content: "Our AI analyzes your drawing and creates a stunning, enhanced version while preserving every detail of your original creativity.",
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      visual: (
        <div className="relative">
          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-200 dark:from-yellow-800/50 dark:to-orange-800/50 rounded-xl mx-auto"
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨
          </motion.div>
        </div>
      )
    },
    {
      title: "Personalized Stories",
      subtitle: "Every drawing gets its own unique bedtime story",
      content: "Describe your drawing and our AI will craft a magical, personalized story that brings your artwork to life.",
      icon: <BookOpen className="w-12 h-12 text-primary" />,
      visual: (
        <motion.div
          className="w-48 h-32 mx-auto bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl p-4 flex items-center justify-center"
          animate={{ rotateY: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="text-center">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              "Once upon a time..."
            </div>
          </div>
        </motion.div>
      )
    },
    {
      title: "Save & Share",
      subtitle: "Download your creations and share the magic",
      content: "Export as PDF, share with family, or save to your personal gallery. Your creations are always available in your account.",
      icon: <Download className="w-12 h-12 text-primary" />,
      visual: (
        <div className="flex justify-center gap-4">
          {['PDF', 'PNG', 'Share'].map((format, i) => (
            <motion.div
              key={format}
              className="w-16 h-20 bg-white dark:bg-neutral-800 rounded-lg shadow-lg flex flex-col items-center justify-center text-xs font-medium"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              <Download className="w-4 h-4 text-primary mb-1" />
              {format}
            </motion.div>
          ))}
        </div>
      )
    }
  ];

  const currentStep = steps[step];

  return (
    <motion.div
      className="text-center max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Visual */}
      <div className="mb-8">
        {currentStep.visual}
      </div>

      {/* Content */}
      <div className="mb-8">
        <motion.div
          className="mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {currentStep.icon}
        </motion.div>
        
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
          {currentStep.title}
        </h2>
        <h3 className="text-lg text-primary mb-4">
          {currentStep.subtitle}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {currentStep.content}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            haptic.light();
            onPrev();
          }}
          disabled={step === 0}
          className={`
            btn-ghost flex items-center gap-2
            ${step === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${i === step ? 'bg-primary w-6' : 'bg-neutral-300 dark:bg-neutral-600'}
              `}
            />
          ))}
        </div>

        {step === steps.length - 1 ? (
          <button
            onClick={() => {
              haptic.success();
              onSkip();
            }}
            className="btn-primary flex items-center gap-2"
          >
            Get Started
            <Sparkles className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              haptic.light();
              onNext();
            }}
            className="btn-primary flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Skip Option */}
      <button
        onClick={() => {
          haptic.light();
          onSkip();
        }}
        className="mt-6 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
      >
        Skip tutorial
      </button>
    </motion.div>
  );
};

export default function OnboardingFlow({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass-card max-w-2xl w-full relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Close Button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 p-2 rounded-full glass-surface hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <AnimatePresence mode="wait">
          <OnboardingStep
            key={currentStep}
            step={currentStep}
            isActive={true}
            onNext={handleNext}
            onPrev={handlePrev}
            onSkip={handleComplete}
          />
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}