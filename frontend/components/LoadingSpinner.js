import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppleProgressRing from './AppleProgressRing';

const loadingMessages = [
  { text: "Analyzing your masterpiece...", icon: "🎨" },
  { text: "Applying AI enhancements...", icon: "✨" },
  { text: "Crafting a unique story...", icon: "📖" },
  { text: "Bringing your drawing to life...", icon: "🌟" },
  { text: "Adding magical touches...", icon: "🪄" },
  { text: "Almost ready...", icon: "🎉" }
];

export default function LoadingSpinner({ message = "", progress = null }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress !== null) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const currentMessage = message || loadingMessages[messageIndex];
  const messageText = typeof currentMessage === 'string' ? currentMessage : currentMessage.text;
  const messageIcon = typeof currentMessage === 'object' ? currentMessage.icon : "✨";

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 px-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Main loading indicator */}
      <div className="relative mb-8">
        {progress !== null ? (
          <AppleProgressRing 
            progress={displayProgress} 
            size={80} 
            strokeWidth={6}
            showPercentage={true}
            className="text-primary"
          />
        ) : (
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-16 h-16 rounded-full border-4 border-neutral-200 dark:border-neutral-700"></div>
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary border-r-primary"></div>
          </motion.div>
        )}
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: `${20 + (i % 2) * 60}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Message display */}
      <div className="text-center max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <motion.span
              className="text-2xl"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {messageIcon}
            </motion.span>
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
              {messageText}
            </h3>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {loadingMessages.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === messageIndex 
                  ? 'bg-primary' 
                  : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
              animate={{
                scale: index === messageIndex ? [1, 1.3, 1] : 1,
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Subtle hint text */}
        <motion.p 
          className="text-sm text-neutral-500 dark:text-neutral-400 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          This usually takes 30-60 seconds
        </motion.p>
      </div>

      {/* Background ambient animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </motion.div>
  );
}