import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, RotateCcw, Sparkles, Heart, Share } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

export default function CombinedOutputDisplay({ creation, resetApp }) {
  const { originalImageUrl, enhancedImageUrl, bedtimeStoryText } = creation || {};
  const contentRef = useRef(null);
  const haptic = useHapticFeedback();

  const handleDownloadPdf = async () => {
    if (!contentRef.current) return;

    haptic.medium();
    
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('your_masterpiece.pdf');
      
      haptic.success();
    } catch (error) {
      console.error('PDF generation failed:', error);
      haptic.error();
    }
  };

  const handleShare = async () => {
    haptic.light();
    
    if (navigator.share && enhancedImageUrl) {
      try {
        await navigator.share({
          title: 'My AI-Enhanced Drawing',
          text: 'Check out my drawing brought to life with AI!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="glass-card" ref={contentRef}>
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <motion.div
              className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className="text-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Masterpiece!
            </h2>
          </div>
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            Your drawing has been transformed into something magical ✨
          </p>
        </motion.div>

        {/* Images Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Original Drawing */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">1</span>
              </div>
              <h3 className="text-title text-neutral-800 dark:text-neutral-200">
                Original Drawing
              </h3>
            </div>
            
            {originalImageUrl ? (
              <motion.div
                className="relative group overflow-hidden rounded-2xl bg-white shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={originalImageUrl}
                  alt="Original Drawing"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ) : (
              <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
                <p className="text-neutral-500">No image available</p>
              </div>
            )}
          </div>

          {/* Enhanced Drawing */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-title text-neutral-800 dark:text-neutral-200">
                AI-Enhanced Drawing
              </h3>
            </div>
            
            {enhancedImageUrl ? (
              <motion.div
                className="relative group overflow-hidden rounded-2xl shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <img
                  src={enhancedImageUrl}
                  alt="Enhanced Drawing"
                  className="w-full h-auto object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Magic sparkle overlay */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-white drop-shadow-lg" />
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className="aspect-square glass-surface rounded-2xl flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-neutral-500">Enhancement in progress...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Story Section */}
        {bedtimeStoryText && (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-title text-neutral-800 dark:text-neutral-200">
                Your Bedtime Story
              </h3>
            </div>
            
            <motion.div
              className="glass-surface p-6 rounded-2xl max-h-96 overflow-y-auto custom-scrollbar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <p className="text-body leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                {bedtimeStoryText}
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <motion.button
            onClick={resetApp}
            className="btn-secondary flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
            Create Another
          </motion.button>
          
          <motion.button
            onClick={handleDownloadPdf}
            className="btn-primary flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            Download PDF
          </motion.button>
          
          <motion.button
            onClick={handleShare}
            className="btn-ghost flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share className="w-4 h-4" />
            Share
          </motion.button>
        </motion.div>

        {/* Floating Action Hint */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p className="text-caption text-neutral-500">
            💡 Tip: Your creation has been saved to your account
          </p>
        </motion.div>
      </div>

      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}