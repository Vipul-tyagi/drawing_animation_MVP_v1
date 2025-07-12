import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, RotateCcw, Sparkles, Heart, Share, Star, Gift } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

const CelebrationEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          {['🎉', '🎊', '✨', '🌟', '💫', '⭐', '🎈', '🎁', '💖', '🦄'][Math.floor(Math.random() * 10)]}
        </div>
      ))}
    </div>
  );
};

const MagicalImageCard = ({ title, imageUrl, isEnhanced = false, number }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div 
          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xl ${
            isEnhanced 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-magical' 
              : 'bg-gradient-to-br from-blue-500 to-green-500 shadow-playful'
          }`}
        >
          {isEnhanced ? '✨' : number}
        </div>
        <h3 className="text-2xl font-display font-bold text-neutral-800 dark:text-neutral-200">
          {title}
        </h3>
        {isEnhanced && (
          <div
            className="px-3 py-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm font-bold rounded-full"
          >
            🎨 AI Enhanced!
          </div>
        )}
      </div>
      
      {imageUrl ? (
        <div
          className={`relative group overflow-hidden rounded-3xl shadow-lg border-4 ${
            isEnhanced ? 'border-purple-300' : 'border-blue-300'
          }`}
          onLoad={() => setImageLoaded(true)}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
              <div
                className="text-4xl"
              >
                🎨
              </div>
            </div>
          )}
          
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto object-contain bg-white dark:bg-neutral-800"
            onLoad={() => setImageLoaded(true)}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Magical sparkles overlay */}
          {isEnhanced && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-yellow-300 text-2xl"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + (i % 2) * 80}%`,
                  }}
                >
                  ✨
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 rounded-3xl flex flex-col items-center justify-center border-4 border-dashed border-neutral-300 dark:border-neutral-600">
          <div
            className="text-6xl mb-4"
          >
            🎨
          </div>
          <p className="text-neutral-500 text-center font-medium">
            Your magical enhancement is being created! ✨
          </p>
        </div>
      )}
    </div>
  );
    </motion.div>
  );
};

export default function MagicalOutputDisplay({ creation, resetApp }) {
  const { originalImageUrl, enhancedImageUrl, bedtimeStoryText } = creation || {};
  const contentRef = useRef(null);
  const haptic = useHapticFeedback();
  const [showCelebration, setShowCelebration] = useState(true);

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
      pdf.save('my_magical_masterpiece.pdf');
      
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
          title: 'My Magical Drawing Story! 🎨✨',
          text: 'Look at my amazing drawing that came to life with AI magic!',
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
    <div
      className="w-full max-w-7xl mx-auto relative"
    >
      {/* Celebration Effect */}
        {showCelebration && (
          <div
          >
            <CelebrationEffect />
          </div>
        )}

      <div className="glass-card border-4 border-primary/30 relative overflow-hidden" ref={contentRef}>
        {/* Magical background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div 
          className="text-center mb-8 relative z-10"
        >
          <div className="inline-flex items-center gap-4 mb-6">
            <div
              className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-magical"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-5xl font-display font-bold rainbow-text mb-2">
                Your Magical Masterpiece! 🎨✨
              </h2>
              <p 
                className="text-xl text-neutral-600 dark:text-neutral-400 font-medium"
              >
                Your drawing has been transformed into something truly magical! 🌟
              </p>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Original Drawing */}
          <MagicalImageCard
            title="Your Amazing Drawing! 🎨"
            imageUrl={originalImageUrl}
            number={1}
          />

          {/* Enhanced Drawing */}
          <MagicalImageCard
            title="AI Magic Enhanced! ✨"
            imageUrl={enhancedImageUrl}
            isEnhanced={true}
            number={2}
          />
        </motion.div>

        {/* Story Section */}
        {bedtimeStoryText && (
          <div 
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-magical"
              >
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-200">
                Your Magical Bedtime Story! 📖✨
              </h3>
            </div>
            
            <div
              className="glass-surface p-8 rounded-3xl max-h-96 overflow-y-auto custom-scrollbar border-4 border-pink-200/50 relative"
            >
              {/* Floating story elements */}
              <div className="absolute inset-0 pointer-events-none">
                {['📖', '✨', '🌟', '💫', '🦄'].map((emoji, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl opacity-20"
                    style={{
                      left: `${10 + i * 20}%`,
                      top: `${5 + (i % 2) * 85}%`,
                    }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              
              <p className="text-lg leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300 font-medium relative z-10">
                {bedtimeStoryText}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="flex flex-col sm:flex-row justify-center gap-6 relative z-10"
        >
          <button
            onClick={resetApp}
            className="btn-secondary flex items-center gap-3 text-lg font-bold py-4 px-8 rounded-full border-4"
          >
            <RotateCcw className="w-5 h-5" />
            🎨 Create Another Masterpiece
          </button>
          
          <button
            onClick={handleDownloadPdf}
            className="magical-button flex items-center gap-3 text-lg font-bold py-4 px-8"
          >
            <Download className="w-5 h-5" />
            📄 Download My Story Book
          </button>
          
          <button
            onClick={handleShare}
            className="btn-ghost flex items-center gap-3 text-lg font-bold py-4 px-8 rounded-full border-4 border-transparent hover:border-primary/30"
          >
            <Share className="w-5 h-5" />
            🌟 Share the Magic
          </button>
        </div>

        {/* Magical completion message */}
        <div
          className="text-center mt-8 relative z-10"
        >
          <div
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full border-4 border-green-200/50"
          >
            <Star className="w-5 h-5 text-yellow-500" />
            <p className="font-bold text-green-700 dark:text-green-400">
              🎉 Your magical creation has been saved to your account! ✨
            </p>
            <Gift className="w-5 h-5 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  );
}