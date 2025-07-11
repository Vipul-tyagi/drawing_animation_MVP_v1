import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, RotateCcw, Sparkles, Heart, Share, Eye, EyeOff, Volume2, VolumeX } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

const MobileImageViewer = ({ title, imageUrl, isEnhanced = false }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const haptic = useHapticFeedback();

  const toggleFullscreen = () => {
    haptic.light();
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
            {title}
          </h3>
          {isEnhanced && (
            <div className="px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm font-bold rounded-full">
              ✨ AI Magic!
            </div>
          )}
        </div>
        
        {imageUrl ? (
          <motion.div
            className="relative group overflow-hidden rounded-2xl shadow-lg border-2 border-primary/30 cursor-pointer"
            onClick={toggleFullscreen}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto object-contain bg-white dark:bg-neutral-800"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/90 rounded-full p-3">
                <Eye className="w-6 h-6 text-neutral-800" />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500">Creating magic...</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && imageUrl && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleFullscreen}
          >
            <motion.div
              className="relative max-w-full max-h-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imageUrl}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white"
              >
                <EyeOff className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const MobileStoryReader = ({ storyText }) => {
  const [isReading, setIsReading] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const haptic = useHapticFeedback();

  const toggleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
        haptic.light();
      } else {
        const utterance = new SpeechSynthesisUtterance(storyText);
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;
        
        utterance.onstart = () => {
          setIsReading(true);
          haptic.light();
        };
        
        utterance.onend = () => {
          setIsReading(false);
          haptic.light();
        };
        
        utterance.onerror = () => {
          setIsReading(false);
          haptic.error();
        };

        window.speechSynthesis.speak(utterance);
        setSpeechSynthesis(utterance);
      }
    }
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          Your Bedtime Story 📖
        </h3>
        
        {'speechSynthesis' in window && (
          <motion.button
            onClick={toggleSpeech}
            className={`
              p-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300
              ${isReading 
                ? 'bg-error text-white animate-pulse' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isReading ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </motion.button>
        )}
      </div>
      
      <div className="glass-surface p-4 rounded-2xl max-h-64 overflow-y-auto custom-scrollbar border-2 border-pink-200/50">
        <p className="text-base leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
          {storyText}
        </p>
      </div>
      
      {'speechSynthesis' in window && (
        <div className="text-center text-sm text-neutral-500">
          {isReading ? '🔊 Reading your story aloud...' : '🎧 Tap speaker to hear your story!'}
        </div>
      )}
    </motion.div>
  );
};

export default function MobileOptimizedOutput({ creation, resetApp }) {
  const { originalImageUrl, enhancedImageUrl, bedtimeStoryText } = creation || {};
  const contentRef = useRef(null);
  const haptic = useHapticFeedback();

  const handleDownloadPdf = async () => {
    haptic.medium();
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: contentRef.current.scrollWidth,
        height: contentRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/png');
      
      if (!imgData || imgData === 'data:,') {
        throw new Error('Failed to capture content');
      }
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        const ratio = pdf.internal.pageSize.getHeight() / pdfHeight;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth * ratio, pdf.internal.pageSize.getHeight());
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save('my_magical_story.pdf');
      haptic.success();
    } catch (error) {
      console.error('PDF generation failed:', error);
      haptic.error();
      alert('Sorry, PDF generation failed. Please try again.');
    }
  };

  const handleShare = async () => {
    haptic.light();
    
    if (navigator.share && enhancedImageUrl) {
      try {
        await navigator.share({
          title: 'My Magical Drawing Story! 🎨✨',
          text: 'Look at my amazing drawing that came to life with AI magic!',
          url: window.location.href,
        });
        haptic.success();
      } catch (error) {
        console.log('Share failed:', error);
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        haptic.light();
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      haptic.light();
    }
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-6" ref={contentRef}>
        {/* Header */}
        <div className="text-center">
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-primary">
              Your Masterpiece! 🎨
            </h2>
          </motion.div>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            Your drawing has been transformed into something magical ✨
          </p>
        </div>

        {/* Images - Stacked on Mobile */}
        <div className="space-y-6">
          {/* Original Drawing */}
          <MobileImageViewer
            title="🎨 Your Amazing Drawing"
            imageUrl={originalImageUrl}
          />

          {/* Enhanced Drawing */}
          <MobileImageViewer
            title="✨ AI-Enhanced Magic"
            imageUrl={enhancedImageUrl}
            isEnhanced={true}
          />
        </div>

        {/* Story Section */}
        {bedtimeStoryText && (
          <MobileStoryReader storyText={bedtimeStoryText} />
        )}

        {/* Action Buttons - Mobile Optimized */}
        <div className="space-y-3">
          <motion.button
            onClick={handleDownloadPdf}
            className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-3 rounded-2xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5" />
            📄 Save My Story Book
          </motion.button>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={handleShare}
              className="btn-secondary text-base py-3 flex items-center justify-center gap-2 rounded-2xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share className="w-4 h-4" />
              🌟 Share
            </motion.button>
            
            <motion.button
              onClick={resetApp}
              className="btn-ghost text-base py-3 flex items-center justify-center gap-2 rounded-2xl border-2 border-primary/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-4 h-4" />
              🎨 New Art
            </motion.button>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full border-2 border-green-200/50">
            <span className="text-lg">🎉</span>
            <p className="text-sm font-bold text-green-700 dark:text-green-400">
              Saved to your magical collection!
            </p>
            <span className="text-lg">✨</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}