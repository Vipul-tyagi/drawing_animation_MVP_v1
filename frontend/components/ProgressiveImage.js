import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const ProgressiveImage = ({ 
  src, 
  alt, 
  className = "", 
  placeholder = null,
  onLoad = () => {},
  priority = false,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    // Intersection Observer for lazy loading
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} {...props}>
      {/* Placeholder */}
      <motion.div
        className={`
          absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200 
          dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center
        `}
        animate={{ opacity: isLoaded ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {placeholder || (
          <motion.div
            className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>

      {/* Actual Image */}
      {isInView && !error && (
        <motion.img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 1.1
          }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      )}

      {/* Error State */}
      {error && (
        <motion.div
          className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 flex flex-col items-center justify-center text-neutral-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Failed to load image</div>
        </motion.div>
      )}

      {/* Loading Shimmer Effect */}
      {!isLoaded && !error && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
};

export default ProgressiveImage;