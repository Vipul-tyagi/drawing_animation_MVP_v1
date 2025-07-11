import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, RotateCcw, Sparkles, Heart, Share } from 'lucide-react';

export default function CombinedOutputDisplay({ creation, resetApp }) {
  const { originalImageUrl, enhancedImageUrl, bedtimeStoryText } = creation || {};
  const contentRef = useRef(null);

  const handleDownloadPdf = async () => {
    if (!contentRef.current) return;
    
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
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  const handleShare = async () => {
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
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-card" ref={contentRef}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-display text-primary">
              Your Masterpiece! 🎨
            </h2>
          </div>
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            Your drawing has been transformed into something magical ✨
          </p>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
              <div className="relative group overflow-hidden rounded-xl bg-white shadow-lg">
                <img
                  src={originalImageUrl}
                  alt="Original Drawing"
                  className="w-full h-auto object-contain"
                />
              </div>
            ) : (
              <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
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
                className="relative group overflow-hidden rounded-xl shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <img
                  src={enhancedImageUrl}
                  alt="Enhanced Drawing"
                  className="w-full h-auto object-contain"
                />
              </motion.div>
            ) : (
              <div className="aspect-square glass-surface rounded-xl flex items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-neutral-500">Enhancement in progress...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Story Section */}
        {bedtimeStoryText && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-title text-neutral-800 dark:text-neutral-200">
                Your Bedtime Story 📖
              </h3>
            </div>
            
            <div className="glass-surface p-6 rounded-xl max-h-80 overflow-y-auto custom-scrollbar">
              <p className="text-body leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                {bedtimeStoryText}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={resetApp}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Create Another
          </button>
          
          <button
            onClick={handleDownloadPdf}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          
          <button
            onClick={handleShare}
            className="btn-ghost flex items-center gap-2"
          >
            <Share className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Success Message */}
        <div className="text-center mt-6">
          <p className="text-caption text-neutral-500">
            💡 Your creation has been saved to your account
          </p>
        </div>
      </div>
    </motion.div>
  );
}