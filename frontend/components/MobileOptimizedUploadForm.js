import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, CheckCircle, Sparkles, X, Mic, MicOff } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

const MobileFilePreview = ({ file, onRemove }) => {
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
      className="relative w-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-card border-2 border-primary/30 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <h3 className="text-lg font-bold text-primary">Your Drawing! 🎨</h3>
          </div>
          <button
            onClick={onRemove}
            className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {preview && (
          <div className="relative overflow-hidden rounded-xl mb-3">
            <img 
              src={preview} 
              alt="Your drawing" 
              className="w-full h-auto max-h-64 object-contain bg-white dark:bg-neutral-800 rounded-lg"
            />
          </div>
        )}
        
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <p className="font-medium">{file.name}</p>
          <p>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
        </div>
      </div>
    </motion.div>
  );
};

const MobileUploadZone = ({ onFileSelect, onCameraCapture, isDragActive, isProcessing }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const haptic = useHapticFeedback();

  const handleFileClick = () => {
    if (!isProcessing) {
      haptic.light();
      fileInputRef.current?.click();
    }
  };

  const handleCameraClick = () => {
    if (!isProcessing) {
      haptic.light();
      cameraInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        accept="image/*"
        disabled={isProcessing}
      />
      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onCameraCapture(e.target.files[0])}
        accept="image/*"
        capture="environment"
        disabled={isProcessing}
      />

      {/* Camera Button - Primary Action */}
      <motion.button
        onClick={handleCameraClick}
        disabled={isProcessing}
        className="w-full btn-primary text-xl py-6 flex items-center justify-center gap-3 rounded-2xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Camera className="w-6 h-6" />
        📸 Take Photo of Drawing
      </motion.button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-neutral-300 dark:bg-neutral-600"></div>
        <span className="text-sm font-medium text-neutral-500">or</span>
        <div className="flex-1 h-px bg-neutral-300 dark:bg-neutral-600"></div>
      </div>

      {/* File Upload Button */}
      <motion.button
        onClick={handleFileClick}
        disabled={isProcessing}
        className="w-full btn-secondary text-lg py-4 flex items-center justify-center gap-3 rounded-2xl"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Upload className="w-5 h-5" />
        📁 Choose from Gallery
      </motion.button>

      {/* Tips */}
      <div className="text-center text-sm text-neutral-500 space-y-1">
        <p>💡 <strong>Best results:</strong> Good lighting, flat surface</p>
        <p>📱 Hold phone steady, capture full drawing</p>
      </div>
    </div>
  );
};

const VoiceStoryInput = ({ value, onChange, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const haptic = useHapticFeedback();

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        haptic.light();
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        onChange(transcript);
      };

      recognition.onend = () => {
        setIsRecording(false);
        haptic.light();
      };

      recognition.onerror = () => {
        setIsRecording(false);
        haptic.error();
      };

      recognition.start();
      setRecognition(recognition);
    }
  };

  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
          Tell us about your drawing! 🗣️
        </h3>
      </div>
      
      <textarea
        rows="4"
        className="input-field resize-none text-base"
        placeholder="Describe your drawing... or use voice input below! 🎤"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isProcessing}
      />

      {/* Voice Input Button */}
      {'webkitSpeechRecognition' in window || 'SpeechRecognition' in window ? (
        <motion.button
          type="button"
          onClick={isRecording ? stopVoiceInput : startVoiceInput}
          disabled={isProcessing}
          className={`
            w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300
            ${isRecording 
              ? 'bg-error text-white animate-pulse' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isRecording ? (
            <>
              <MicOff className="w-5 h-5" />
              🔴 Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              🎤 Tell Your Story
            </>
          )}
        </motion.button>
      ) : (
        <div className="text-center text-sm text-neutral-500 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          Voice input not supported on this device
        </div>
      )}

      {/* Quick Story Prompts */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          💡 Quick ideas:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "🏰 Adventure story",
            "🦄 Magical tale", 
            "🌈 Happy ending",
            "🐻 Animal friends"
          ].map((prompt, index) => (
            <button
              key={index}
              onClick={() => onChange(value + (value ? ' ' : '') + prompt)}
              className="px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function MobileOptimizedUploadForm({ onGenerateClick, setError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [story, setStory] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const haptic = useHapticFeedback();

  const validateFile = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      haptic.error();
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
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

  const handleCameraCapture = useCallback((file) => {
    if (!validateFile(file)) return;
    haptic.success();
    setError(null);
    setSelectedFile(file);
  }, [validateFile, haptic, setError]);

  const handleGenerateStoryClick = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    haptic.medium();

    try {
      await onGenerateClick(selectedFile, story);
    } catch (error) {
      haptic.error();
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setStory('');
    haptic.light();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Share Your Amazing Drawing! 🎨
          </h2>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            Take a photo or upload your artwork to create magic! ✨
          </p>
        </div>

        {/* File Preview or Upload */}
        <AnimatePresence mode="wait">
          {selectedFile ? (
            <MobileFilePreview
              key="preview"
              file={selectedFile}
              onRemove={clearSelection}
            />
          ) : (
            <div key="upload" className="glass-card">
              <MobileUploadZone
                onFileSelect={handleFileSelect}
                onCameraCapture={handleCameraCapture}
                isProcessing={isProcessing}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Story Input */}
        <div className="glass-card">
          <VoiceStoryInput
            value={story}
            onChange={setStory}
            isProcessing={isProcessing}
          />
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerateStoryClick}
          disabled={!selectedFile || isProcessing}
          className={`
            w-full btn-primary text-xl py-6 flex items-center justify-center gap-3 rounded-2xl
            ${(!selectedFile || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          whileHover={selectedFile && !isProcessing ? { scale: 1.02 } : {}}
          whileTap={selectedFile && !isProcessing ? { scale: 0.98 } : {}}
        >
          <Sparkles className="w-6 h-6" />
          {isProcessing ? '🎭 Creating Magic...' : '✨ Bring My Drawing to Life!'}
        </motion.button>

        {/* Mobile Tips */}
        <div className="glass-card border-2 border-yellow-300/30">
          <h4 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center gap-2">
            <span className="text-2xl">📱</span>
            Mobile Photo Tips
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌟</span>
              <span>Use natural light or bright room lighting</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📐</span>
              <span>Place drawing on flat surface</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <span>Hold phone directly above drawing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span>Make sure entire drawing is visible</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}