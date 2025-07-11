import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const magicalMessages = [
  { text: "Sprinkling magic dust on your drawing...", emoji: "✨", color: "text-primary" },
  { text: "Teaching our AI to see the wonder in your art...", emoji: "👁️‍🗨️", color: "text-secondary" },
  { text: "Brewing up a magical story just for you...", emoji: "🧙‍♀️", color: "text-purple-500" },
  { text: "Adding rainbow sparkles to every line...", emoji: "🌈", color: "text-pink-500" },
  { text: "Whispering secrets to the story fairies...", emoji: "🧚‍♀️", color: "text-green-500" },
  { text: "Painting dreams with digital brushes...", emoji: "🎨", color: "text-yellow-500" },
  { text: "Almost ready to share the magic...", emoji: "🎉", color: "text-red-500" }
];

const FloatingEmoji = ({ emoji, delay = 0 }) => (
  <motion.div
    className="absolute text-4xl pointer-events-none"
    initial={{ 
      opacity: 0, 
      scale: 0,
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200
    }}
    animate={{ 
      opacity: [0, 1, 1, 0],
      scale: [0, 1.2, 1, 0.8],
      y: [0, -50, -100, -150],
      rotate: [0, 180, 360]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    {emoji}
  </motion.div>
);

const RainbowProgressRing = ({ progress = 0, size = 120 }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 filter drop-shadow-lg"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="16.66%" stopColor="#ffa726" />
            <stop offset="33.33%" stopColor="#ffeb3b" />
            <stop offset="50%" stopColor="#66bb6a" />
            <stop offset="66.66%" stopColor="#42a5f5" />
            <stop offset="83.33%" stopColor="#7986cb" />
            <stop offset="100%" stopColor="#ab47bc" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="6"
          fill="none"
          className="dark:stroke-neutral-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#rainbowGradient)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter="url(#glow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-3xl mb-2">🎨</div>
          <div className="text-lg font-bold text-primary">
            {Math.round(progress)}%
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default function MagicalLoadingSpinner({ message = "", progress = null }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % magicalMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 95) {
      setShowCelebration(true);
    }
  }, [progress]);

  const currentMessage = message || magicalMessages[messageIndex];
  const messageText = typeof currentMessage === 'string' ? currentMessage : currentMessage.text;
  const messageEmoji = typeof currentMessage === 'object' ? currentMessage.emoji : "✨";
  const messageColor = typeof currentMessage === 'object' ? currentMessage.color : "text-primary";

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 px-8 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Floating magical elements */}
      <div className="absolute inset-0 pointer-events-none">
        {['✨', '🌟', '💫', '⭐', '🎨', '🌈', '🦄', '🧚‍♀️'].map((emoji, i) => (
          <FloatingEmoji key={i} emoji={emoji} delay={i * 0.5} />
        ))}
      </div>

      {/* Main loading indicator */}
      <div className="relative mb-8 z-10">
        {progress !== null ? (
          <RainbowProgressRing progress={progress} />
        ) : (
          <motion.div
            className="relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-24 h-24 rounded-full border-8 border-transparent bg-gradient-to-r from-primary via-secondary to-primary bg-clip-border animate-pulse-rainbow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-4xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🎨
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Message display */}
      <div className="text-center max-w-md z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <motion.span
              className="text-3xl"
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 15, -15, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {messageEmoji}
            </motion.span>
            <h3 className={`text-xl font-bold ${messageColor} font-display`}>
              {messageText}
            </h3>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {magicalMessages.map((_, index) => (
            <motion.div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === messageIndex 
                  ? 'bg-primary shadow-magical' 
                  : 'bg-neutral-300 dark:bg-neutral-600'
              }`}
              animate={{
                scale: index === messageIndex ? [1, 1.4, 1] : 1,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Encouraging message */}
        <motion.div
          className="glass-surface p-4 rounded-2xl border-2 border-primary/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">
            🌟 Your masterpiece is being transformed into something truly magical! 
            This usually takes 30-60 seconds of pure wonder ✨
          </p>
        </motion.div>
      </div>

      {/* Celebration effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  rotate: [0, 360],
                  y: [0, -100]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                {['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}