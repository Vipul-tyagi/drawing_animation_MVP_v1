import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { Upload, Image, Sparkles, Camera, CheckCircle, FileImage, Zap } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useSmartNotifications } from './SmartNotifications';
import { usePerformanceMonitor } from './PerformanceMonitor';
import ProgressiveImage from './ProgressiveImage';
import { HelpTooltip } from './ContextualHelp';

const FilePreview = ({ file, onRemove }) => {
  const [preview, setPreview] = useState(null);

  useState(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  }, [file]);

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-surface p-4 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="w-5 h-5 text-success" />
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">
            Your Drawing
          </h3>
        </div>
        
        {preview && (
          <div className="relative overflow-hidden rounded-xl mb-3">
            <ProgressiveImage
              src={preview}
              alt="Drawing preview"
              className="w-full h-48 object-contain bg-white dark:bg-neutral-800"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
          <span>{file.name}</span>
          <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
        </div>
        
        <button
          onClick={onRemove}
          className="mt-3 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Choose Different Image
        </button>
      </div>
    </motion.div>
  );
};

const UploadZone = ({ onFileSelect, isDragActive, isProcessing }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <motion.div
      className={`
        relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
        ${isDragActive 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-neutral-300 dark:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-800/50'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 hover:bg-primary/5'}
      `}
      onClick={handleClick}
      whileHover={!isProcessing ? { scale: 1.01 } : {}}
      transition={{ duration: 0.2 }}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        accept="image/*"
        disabled={isProcessing}
      />
      
      <motion.div
        className="flex flex-col items-center justify-center"
        animate={{ y: isDragActive ? -5 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={`
            p-4 rounded-2xl mb-4 transition-colors duration-300
            ${isDragActive 
              ? 'bg-primary text-white' 
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
            }
          `}
          animate={{ 
            scale: isDragActive ? 1.1 : 1,
            rotate: isDragActive ? [0, -5, 5, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <FileImage className="w-8 h-8" />
        </motion.div>
        
        <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          {isDragActive ? 'Drop your drawing here!' : 'Drag and drop your drawing here'}
        </h3>
        
        <p className="text-neutral-500 dark:text-neutral-400 mb-6">
          or
        </p>
        
        <motion.button
          type="button"
          className="btn-primary flex items-center gap-2"
          disabled={isProcessing}
          whileHover={!isProcessing ? { scale: 1.05 } : {}}
          whileTap={!isProcessing ? { scale: 0.95 } : {}}
        >
          <Camera className="w-4 h-4" />
          Browse Files
        </motion.button>
        
        <p className="text-caption mt-4">
          Supports JPG, PNG up to 5MB
        </p>
      </motion.div>
    </motion.div>
  );
};

const StoryInput = ({ value, onChange, isProcessing }) => {
  const [charCount, setCharCount] = useState(value.length);
  const maxChars = 500;

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxChars) {
      onChange(newValue);
      setCharCount(newValue.length);
    }
  };

  const suggestions = [
    "A brave knight fighting a dragon to save a princess",
    "A friendly monster having a picnic with a cat",
    "A magical tree that grows candy in a colorful forest",
    "A superhero flying through the clouds",
    "A family of animals having an adventure"
  ];

  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <motion.div
      className="glass-surface p-6 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <label htmlFor="story" className="text-title text-neutral-800 dark:text-neutral-200">
          What's the story behind your drawing?
        </label>
        <HelpTooltip content="Describe your drawing to help our AI create a more personalized story">
          <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </HelpTooltip>
      </div>
      
      <div className="relative">
        <textarea
          id="story"
          name="story"
          rows="4"
          className="input-field resize-none pr-16"
          placeholder="Tell us about your drawing... (e.g., 'This is a happy sun flying over a house with a dog playing in the garden.')"
          value={value}
          onChange={handleChange}
          disabled={isProcessing}
        />
        
        {/* Character Counter */}
        <div className={`
          absolute bottom-3 right-3 text-xs font-medium
          ${charCount > maxChars * 0.9 ? 'text-warning' : 'text-neutral-400'}
        `}>
          {charCount}/{maxChars}
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-4">
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          {showSuggestions ? 'Hide' : 'Show'} example ideas
        </button>
        
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              className="mt-3 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => onChange(suggestion)}
                  className="block w-full text-left p-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  "{suggestion}"
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default function EnhancedUploadForm({ onGenerateClick, setError }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [story, setStory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const haptic = useHapticFeedback();
  const notifications = useSmartNotifications();
  const { markStart, markEnd } = usePerformanceMonitor();

  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (selectedFile && story.trim()) {
        handleGenerateStoryClick();
      }
    },
    trackMouse: true,
    delta: 50,
  });

  const validateFile = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      notifications.notifyUploadError('File must be an image');
      haptic.error();
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      notifications.notifyUploadError('File size too large (max 5MB)');
      haptic.error();
      return false;
    }

    return true;
  }, [setError, notifications, haptic]);

  const handleFileSelect = useCallback((file) => {
    markStart('file_validation');
    
    if (!validateFile(file)) {
      markEnd('file_validation');
      return;
    }

    haptic.success();
    setError(null);
    setSelectedFile(file);
    notifications.notifyUploadSuccess(file.name);
    
    markEnd('file_validation');
  }, [validateFile, haptic, setError, notifications, markStart, markEnd]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    haptic.light();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [haptic, handleFileSelect]);

  const handleGenerateStoryClick = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    haptic.medium();
    markStart('story_generation');
    notifications.notifyProcessingStart();

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      await onGenerateClick(selectedFile, story);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        notifications.notifyProcessingComplete();
        markEnd('story_generation');
      }, 500);
      
    } catch (error) {
      notifications.notifyUploadError(error.message);
      haptic.error();
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setStory('');
    haptic.light();
  };

  return (
    <div className="w-full max-w-6xl mx-auto" {...swipeHandlers}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Upload Area */}
        <div className="lg:col-span-3">
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-headline text-neutral-800 dark:text-neutral-100">
                  Upload Your Drawing
                </h2>
              </motion.div>
              <p className="text-body text-neutral-600 dark:text-neutral-400">
                Upload a drawing to enhance it and generate a magical bedtime story!
              </p>
            </div>

            {/* File Preview or Upload Zone */}
            <AnimatePresence mode="wait">
              {selectedFile ? (
                <FilePreview
                  key="preview"
                  file={selectedFile}
                  onRemove={clearSelection}
                />
              ) : (
                <div
                  key="upload"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <UploadZone
                    onFileSelect={handleFileSelect}
                    isDragActive={dragActive}
                    isProcessing={isProcessing}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Story Input */}
            <div className="mt-8">
              <StoryInput
                value={story}
                onChange={setStory}
                isProcessing={isProcessing}
              />
            </div>

            {/* Generate Button */}
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <motion.button
                onClick={handleGenerateStoryClick}
                disabled={!selectedFile || isProcessing}
                className={`
                  btn-primary text-lg px-8 py-4 relative overflow-hidden
                  ${(!selectedFile || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                whileHover={selectedFile && !isProcessing ? { scale: 1.05 } : {}}
                whileTap={selectedFile && !isProcessing ? { scale: 0.95 } : {}}
              >
                <motion.div
                  className="flex items-center gap-3"
                  animate={isProcessing ? { x: [0, 5, -5, 0] } : {}}
                  transition={{ duration: 0.5, repeat: isProcessing ? Infinity : 0 }}
                >
                  <Zap className="w-5 h-5" />
                  {isProcessing ? 'Creating Magic...' : 'Bring My Drawing to Life!'}
                </motion.div>
                
                {/* Progress Bar */}
                {isProcessing && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
                    initial={{ width: '0%' }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                {selectedFile && !isProcessing && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  />
                )}
              </motion.button>
              
              {selectedFile && (
                <motion.p
                  className="text-caption mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  💡 Tip: Swipe up to generate your story quickly!
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Tips Sidebar */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="glass-card sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-5 h-5 text-primary" />
              <h4 className="text-title text-neutral-800 dark:text-neutral-200">
                Photo Tips
              </h4>
            </div>
            
            <ul className="space-y-4">
              {[
                { icon: "🌟", text: "Good lighting (natural light is best!)", tip: "Avoid harsh shadows and dark areas" },
                { icon: "📐", text: "Flat surface (no wrinkles or curves)", tip: "Place on a table or clipboard" },
                { icon: "🎯", text: "Full drawing visible", tip: "Make sure nothing is cut off" },
                { icon: "🚫", text: "Minimal shadows", tip: "Position light source above the drawing" },
                { icon: "📱", text: "Hold phone steady", tip: "Use both hands or a tripod" }
              ].map((tip, index) => (
                <motion.li
                  key={index}
                  className="group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <HelpTooltip content={tip.tip}>
                    <div className="flex items-start gap-3 text-caption cursor-help">
                      <span className="text-lg flex-shrink-0">{tip.icon}</span>
                      <span className="text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
                        {tip.text}
                      </span>
                    </div>
                  </HelpTooltip>
                </motion.li>
              ))}
            </ul>
            
            <motion.div
              className="mt-6 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div>
                  <p className="font-semibold text-primary mb-1">Pro Tip:</p>
                  <p className="text-caption text-neutral-600 dark:text-neutral-400">
                    Take the photo from directly above the drawing for the best results!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}