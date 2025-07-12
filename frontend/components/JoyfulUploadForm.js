import { useState, useRef, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Upload, Image, Sparkles, Camera, CheckCircle, FileImage, Zap, Heart } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

const MagicalFilePreview = ({ file, onRemove }) => {
  const [preview, setPreview] = useState(null);

  useState(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  }, [file]);

  return (
    <div
      className="relative group"
    >
      <div className="glass-card border-4 border-primary/30 relative overflow-hidden">
        {/* Magical sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-400"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 2) * 80}%`,
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div
            className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-5 h-5 text-white" />
          </motion.div>
          <h3 className="font-display text-xl font-bold text-primary">
            Your Amazing Drawing! 🎨
          </h3>
        </div>
        
        {preview && (
          <div className="relative overflow-hidden rounded-2xl mb-4 border-4 border-white/50">
            <img 
              src={preview} 
              alt="Your wonderful drawing" 
              className="w-full h-48 object-contain bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Floating hearts */}
            <div
              className="absolute top-2 right-2 text-2xl"
            >
              💖
            </motion.div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          <span className="font-medium">📁 {file.name}</span>
          <span className="px-2 py-1 bg-primary/20 rounded-full font-bold text-primary">
            {(file.size / 1024 / 1024).toFixed(1)} MB
          </span>
        </div>
        
        <button
          onClick={onRemove}
          className="w-full py-2 px-4 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-bold rounded-full hover:from-orange-500 hover:to-pink-500 transition-all duration-300"
        >
          🔄 Choose a Different Drawing
        </motion.button>
      </div>
    </motion.div>
  );
};

const MagicalUploadZone = ({ onFileSelect, isDragActive, isProcessing }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={`
        relative border-4 border-dashed rounded-3xl p-12 text-center transition-all duration-500 cursor-pointer overflow-hidden
        ${isDragActive 
          ? 'border-primary bg-gradient-to-br from-primary/20 to-secondary/20 scale-105' 
          : 'border-primary/40 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-secondary/10 hover:scale-102'}
      `}
      onClick={handleClick}
    >
      {/* Magical background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        accept="image/*"
        disabled={isProcessing}
      />
      
      <div
        className="flex flex-col items-center justify-center relative z-10"
      >
        <div
          className={`
            p-6 rounded-3xl mb-6 transition-all duration-500
            ${isDragActive 
              ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-magical' 
              : 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-playful'
            }
          `}
        >
          <FileImage className="w-12 h-12" />
        </motion.div>
        
        <h3 
          className="text-2xl font-display font-bold text-primary mb-3"
        >
          {isDragActive ? '🎉 Drop your masterpiece here!' : '🎨 Share Your Amazing Drawing!'}
        </motion.h3>
        
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6 font-medium">
          Drag and drop your artwork here, or click to browse
        </p>
        
        <button
          type="button"
          className="magical-button flex items-center gap-3 text-lg font-bold"
          disabled={isProcessing}
        >
          <Camera className="w-6 h-6" />
          📸 Choose Your Drawing
        </motion.button>
        
        <p 
          className="text-sm text-neutral-500 mt-4 font-medium"
        >
          ✨ We support JPG, PNG up to 5MB ✨
        </motion.p>
      </div>
    </div>
  );
};

const MagicalStoryInput = ({ value, onChange, isProcessing }) => {
  const [charCount, setCharCount] = useState(value.length);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const maxChars = 500;

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxChars) {
      onChange(newValue);
      setCharCount(newValue.length);
    }
  };

  const suggestions = [
    "🏰 A brave princess saving a dragon from a mean knight!",
    "🦄 A magical unicorn having a tea party with friendly monsters!",
    "🌈 A rainbow bridge leading to a land made of candy!",
    "🚀 A superhero cat flying through space to save the moon!",
    "🧚‍♀️ Fairy friends building the most amazing treehouse ever!",
    "🐻 A teddy bear's adventure in the land of dreams!",
    "🌟 A shooting star that grants wishes to all the animals!"
  ];

  return (
    <div
      className="glass-card border-4 border-secondary/30 relative overflow-hidden"
    >
      {/* Magical sparkles background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${10 + i * 20}%`,
              top: `${10 + (i % 2) * 70}%`,
            }}
          >
            {['✨', '🌟', '💫', '⭐', '🎨'][i]}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div
          className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <label htmlFor="story" className="text-2xl font-display font-bold text-secondary">
          Tell Us About Your Amazing Drawing! 📖
        </label>
      </div>
      
      <div className="relative mb-6">
        <textarea
          id="story"
          name="story"
          rows="5"
          className="input-field resize-none pr-20 text-lg border-4 border-purple-200 focus:border-purple-400 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20"
          placeholder="🌟 Tell us the magical story of your drawing... What adventure is happening? Who are the characters? What makes it special? 🌟"
          value={value}
          onChange={handleChange}
          disabled={isProcessing}
        />
        
        {/* Character Counter */}
        <div className={`
          absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm font-bold
          ${charCount > maxChars * 0.9 ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'}
        `}>
          {charCount}/{maxChars} ✨
        </div>
      </div>

      {/* Magical suggestions */}
      <div className="relative z-10">
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="flex items-center gap-2 text-lg font-bold text-primary hover:text-secondary transition-colors duration-300 mb-4"
        >
          <span>
            🎭
          </span>
          {showSuggestions ? 'Hide' : 'Show'} Magical Story Ideas
        </button>
        
        {showSuggestions && (
            <div
              className="space-y-3"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onChange(suggestion)}
                  className="block w-full text-left p-4 text-base bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800/40 dark:hover:to-pink-800/40 rounded-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/30"
                >
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}
      </div>
    </motion.div>
  );
};

export default function JoyfulUploadForm({ onGenerateClick, setError }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [story, setStory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const haptic = useHapticFeedback();

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
      setError('🎨 Oops! Please upload a picture of your drawing (JPG, PNG, etc.)');
      haptic.error();
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('📏 Your drawing file is too big! Please make it smaller than 5MB');
      haptic.error();
      return false;
    }

    return true;
  }, [setError, haptic]);

  const handleFileSelect = useCallback((file) => {
    if (!validateFile(file)) return;

    haptic.success();
    setError(null);
    setSelectedFile(file);
  }, [validateFile, haptic, setError]);

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
      
    } catch (error) {
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
    <div className="w-full max-w-7xl mx-auto" {...swipeHandlers}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Upload Area */}
        <div className="lg:col-span-3">
          <div
            className="glass-card border-4 border-primary/20 relative overflow-hidden"
          >
            {/* Magical header */}
            <div className="text-center mb-8 relative">
              <div
                className="inline-flex items-center gap-4 mb-6"
              >
                <div
                  className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-magical"
                >
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-display font-bold rainbow-text">
                  Share Your Amazing Drawing! 🎨
                </h2>
              </div>
              <p
                className="text-xl text-neutral-600 dark:text-neutral-400 font-medium"
              >
                Upload your artwork and we'll create a magical bedtime story just for you! ✨
              </p>
            </div>

            {/* File Preview or Upload Zone */}
            <AnimatePresence mode="wait">
              {selectedFile ? (
                <MagicalFilePreview
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
                  <MagicalUploadZone
                    onFileSelect={handleFileSelect}
                    isDragActive={dragActive}
                    isProcessing={isProcessing}
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Story Input */}
            <div className="mt-8">
              <MagicalStoryInput
                value={story}
                onChange={setStory}
                isProcessing={isProcessing}
              />
            </div>

            {/* Generate Button */}
            <div
              className="text-center mt-8"
            >
              <button
                onClick={handleGenerateStoryClick}
                disabled={!selectedFile || isProcessing}
                className={`
                  relative overflow-hidden px-12 py-6 text-2xl font-display font-bold rounded-full
                  bg-gradient-to-r from-primary via-secondary to-primary bg-size-200 
                  text-white shadow-magical border-4 border-white/30
                  ${(!selectedFile || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-rainbow animate-rainbow'}
                `}
              >
                <div
                  className="flex items-center gap-4"
                >
                  <span>
                    {isProcessing ? '🎭' : '✨'}
                  </span>
                  {isProcessing ? '🎨 Creating Your Magic Story...' : '🚀 Bring My Drawing to Life!'}
                  <Heart className="w-6 h-6" />
                </div>
                
                {/* Progress Bar */}
                {isProcessing && (
                  <div
                    className="absolute bottom-0 left-0 h-2 bg-white/40 rounded-b-full"
                  />
                )}
                
                {/* Magical shimmer effect */}
                {selectedFile && !isProcessing && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                )}
              </button>
              
              {selectedFile && (
                <p
                  className="text-lg font-medium text-primary mt-4"
                >
                  💡 Swipe up to create your story quickly! 📱✨
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Magical Tips Sidebar */}
        <div
          className="lg:col-span-1"
        >
          <div className="glass-card sticky top-8 border-4 border-yellow-300/30 relative overflow-hidden">
            {/* Floating elements */}
            <div className="absolute inset-0 pointer-events-none">
              {['📸', '🌟', '💡', '🎨', '✨'].map((emoji, i) => (
                <div
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + (i % 3) * 30}%`,
                  }}
                >
                  {emoji}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div
                className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
              >
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-xl font-display font-bold text-yellow-600 dark:text-yellow-400">
                📸 Photo Magic Tips
              </h4>
            </div>
            
            <ul className="space-y-4 relative z-10">
              {[
                { icon: "🌟", text: "Use bright, happy lighting!", tip: "Natural sunlight makes colors pop!" },
                { icon: "📐", text: "Keep your drawing flat", tip: "No wrinkles or curves for best results" },
                { icon: "🎯", text: "Show the whole drawing", tip: "Make sure nothing gets cut off" },
                { icon: "🚫", text: "Avoid dark shadows", tip: "Even lighting helps our AI see better" },
                { icon: "📱", text: "Hold your phone steady", tip: "Use both hands for the clearest photo" }
              ].map((tip, index) => (
                <li
                  key={index}
                  className="group cursor-pointer"
                >
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 group-hover:from-yellow-100 group-hover:to-orange-100 dark:group-hover:from-yellow-800/30 dark:group-hover:to-orange-800/30 transition-all duration-300">
                    <span 
                      className="text-2xl flex-shrink-0"
                    >
                      {tip.icon}
                    </span>
                    <div>
                      <span className="font-bold text-neutral-700 dark:text-neutral-300 block">
                        {tip.text}
                      </span>
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        {tip.tip}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div
              className="mt-6 p-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl border-4 border-purple-200/50 relative z-10"
            >
              <div className="flex items-start gap-3">
                <span 
                  className="text-3xl"
                >
                  💡
                </span>
                <div>
                  <p className="font-display font-bold text-purple-600 dark:text-purple-400 mb-2 text-lg">
                    Super Secret Tip! 🤫
                  </p>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Take your photo from directly above your drawing for the most magical results! ✨
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}