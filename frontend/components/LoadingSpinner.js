import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const loadingMessages = [
  "Analyzing your drawing... 🎨",
  "Creating your story... ✨", 
  "Adding magical touches... 🌟",
  "Almost ready... 🎉"
];

export default function LoadingSpinner({ message = "", progress = null }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = message || loadingMessages[messageIndex];

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Simple loading indicator */}
      <div className="relative mb-6">
        {progress !== null ? (
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-neutral-200 dark:text-neutral-700"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                className="text-primary"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        ) : (
          <motion.div
            className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* Message */}
      <motion.div
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-center"
      >
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
          {currentMessage}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          This usually takes 30-60 seconds
        </p>
      </motion.div>
    </motion.div>
  );
}