import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { Upload, Image, Sparkles, Camera, CheckCircle } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

export default function UploadForm({ onGenerateClick, setError }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [story, setStory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    haptic.light();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      haptic.error();
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      haptic.error();
      return;
    }

    haptic.success();
    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const handleGenerateStoryClick = async () => {
    if (selectedFile) {
      setIsProcessing(true);
      haptic.medium();
      try {
        await onGenerateClick(selectedFile, story);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const clearSelection = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

            {/* Image Preview */}
            <AnimatePresence>
              {preview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="mb-8 p-6 glass-surface rounded-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <h3 className="text-title text-neutral-800 dark:text-neutral-200">
                      Your Drawing
                    </h3>
                  </div>
                  
                  <div className="relative group">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-auto max-h-80 object-contain mx-auto rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-xl" />
                  </div>
                  
                  <motion.button
                    onClick={clearSelection}
                    className="mt-4 btn-ghost text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Choose Different Image
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Zone */}
            <motion.div
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                ${dragActive 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : 'border-neutral-300 dark:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-800/50'
                }
                ${preview ? 'opacity-60' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              whileHover={{ scale: preview ? 1 : 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleChange}
                accept="image/*"
                disabled={isProcessing}
              />
              
              <motion.div
                className="flex flex-col items-center justify-center"
                animate={{ y: dragActive ? -5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className={`
                    p-4 rounded-2xl mb-4 transition-colors duration-300
                    ${dragActive 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }
                  `}
                  animate={{ 
                    scale: dragActive ? 1.1 : 1,
                    rotate: dragActive ? [0, -5, 5, 0] : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Image className="w-8 h-8" />
                </motion.div>
                
                <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  {dragActive ? 'Drop your drawing here!' : 'Drag and drop your drawing here'}
                </h3>
                
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                  or
                </p>
                
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                  disabled={isProcessing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Browse Files
                </motion.button>
                
                <p className="text-caption mt-4">
                  Supports JPG, PNG up to 5MB
                </p>
              </motion.div>
            </motion.div>

            {/* Story Input */}
            <motion.div
              className="mt-8 p-6 glass-surface rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <label htmlFor="story" className="text-title text-neutral-800 dark:text-neutral-200">
                  What's the story behind your drawing?
                </label>
              </div>
              
              <div className="flex items-start gap-3 text-caption mb-4 p-3 bg-primary/5 rounded-xl">
                <div className="w-4 h-4 mt-0.5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <p>
                  Your description helps our AI craft a more relevant and unique bedtime story.
                </p>
              </div>
              
              <div className="mb-4">
                <p className="text-caption mb-2">For example:</p>
                <ul className="text-caption space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    "A brave knight fighting a dragon to save a princess."
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    "A friendly monster having a picnic with a cat."
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    "A magical tree that grows candy in a colorful forest."
                  </li>
                </ul>
              </div>
              
              <textarea
                id="story"
                name="story"
                rows="4"
                className="input-field resize-none"
                placeholder="Tell us about your drawing... (e.g., 'This is a happy sun flying over a house with a dog playing in the garden.')"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                disabled={isProcessing}
              />
            </motion.div>

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
                  <Sparkles className="w-5 h-5" />
                  {isProcessing ? 'Creating Magic...' : 'Bring My Drawing to Life!'}
                </motion.div>
                
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

        {/* Tips Sidebar */}
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
                { icon: "🌟", text: "Good lighting (natural light is best!)" },
                { icon: "📐", text: "Flat surface (no wrinkles or curves)" },
                { icon: "🎯", text: "Full drawing visible" },
                { icon: "🚫", text: "Minimal shadows" },
                { icon: "📱", text: "Hold phone steady" }
              ].map((tip, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-3 text-caption"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <span className="text-lg flex-shrink-0">{tip.icon}</span>
                  <span className="text-neutral-600 dark:text-neutral-400">{tip.text}</span>
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