import { useState, useEffect } from 'react';
import { HelpCircle, X, ChevronRight, Lightbulb, Camera, Sparkles } from 'lucide-react';

const HelpTooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
          <div
            className={`absolute z-50 ${positions[position]}`}
          >
            <div className="glass-surface px-3 py-2 rounded-lg shadow-lg max-w-xs">
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {content}
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

const ContextualTips = ({ currentStep }) => {
  const tips = {
    upload: [
      {
        icon: <Camera className="w-5 h-5 text-primary" />,
        title: "Perfect Photo Tips",
        content: "Use natural lighting and place your drawing on a flat surface for best results."
      },
      {
        icon: <Lightbulb className="w-5 h-5 text-warning" />,
        title: "Pro Tip",
        content: "Drawings with clear outlines and good contrast work best with our AI enhancement."
      }
    ],
    processing: [
      {
        icon: <Sparkles className="w-5 h-5 text-primary" />,
        title: "AI Magic in Progress",
        content: "Our AI is analyzing your drawing and creating a unique story just for you."
      }
    ],
    results: [
      {
        icon: <Sparkles className="w-5 h-5 text-success" />,
        title: "Your Creation is Ready!",
        content: "Download as PDF to share with family or save to your device."
      }
    ]
  };

  const currentTips = tips[currentStep] || [];

  if (currentTips.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-40 max-w-sm"
    >
      <div className="space-y-3">
        {currentTips.map((tip, index) => (
          <div
            key={index}
            className="glass-card p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {tip.icon}
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  {tip.title}
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {tip.content}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const HelpCenter = ({ isOpen, onClose }) => {
  const faqs = [
    {
      question: "What types of drawings work best?",
      answer: "Any drawing works! For best results, use clear, well-lit photos of drawings on plain backgrounds. Simple sketches to detailed artwork all create amazing stories."
    },
    {
      question: "How long does the AI processing take?",
      answer: "Most creations are ready in 30-60 seconds. Complex drawings with many elements may take slightly longer as our AI carefully analyzes each detail."
    },
    {
      question: "Can I edit the generated story?",
      answer: "Currently, stories are automatically generated based on your drawing and description. We're working on editing features for future updates!"
    },
    {
      question: "Is my artwork safe and private?",
      answer: "Yes! Your drawings and stories are securely stored and only visible to you. We never share your creations without permission."
    },
    {
      question: "Can I download my creations?",
      answer: "Absolutely! You can download your enhanced drawings and stories as PDF files to share with family or print at home."
    }
  ];

  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            className="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  Help Center
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full glass-surface hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Tips */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
                Quick Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-surface p-4 rounded-xl">
                  <Camera className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Perfect Photos</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Use good lighting and avoid shadows for best AI results
                  </p>
                </div>
                <div className="glass-surface p-4 rounded-xl">
                  <Sparkles className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-medium mb-1">Describe Your Art</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Add details about your drawing for more personalized stories
                  </p>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="glass-surface rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {faq.question}
                      </span>
                      <div>
                        <ChevronRight className="w-5 h-5 text-neutral-500" />
                      </div>
                    </button>
                    
                    {expandedFaq === index && (
                        <div
                          className="px-4 pb-4 text-neutral-600 dark:text-neutral-400"
                        >
                          {faq.answer}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
  );
};

export { HelpTooltip, ContextualTips, HelpCenter };