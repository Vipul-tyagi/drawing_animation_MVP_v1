import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Eye, Sparkles, Calendar, FileText, Image as ImageIcon, Plus } from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';
import MagicalLoadingSpinner from '../components/MagicalLoadingSpinner';
import ThemeToggle from '../components/ThemeToggle';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

const CreationCard = ({ creation, onView, onDownload }) => {
  const haptic = useHapticFeedback();
  
  const handleView = () => {
    haptic.light();
    onView(creation.creationId);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    haptic.medium();
    onDownload(creation.enhancedImageUrl || creation.originalImageUrl, `creation_${creation.creationId.substring(0, 8)}.png`);
  };

  return (
    <motion.div
      className="card-interactive group border-4 border-primary/20 hover:border-primary/40"
      onClick={handleView}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-4 border-2 border-white/50">
        {creation.enhancedImageUrl || creation.originalImageUrl ? (
          <>
            <img
              src={creation.enhancedImageUrl || creation.originalImageUrl}
              alt="Creation"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Enhanced Badge */}
            {creation.enhancedImageUrl && (
              <motion.div 
                className="absolute top-3 right-3 glass-surface px-3 py-2 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-primary">✨ Magic!</span>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <ImageIcon className="w-12 h-12 text-primary" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-display font-bold text-primary mb-2">
            🎨 Masterpiece #{creation.creationId.substring(0, 8)}
          </h3>
          <p className="text-base font-medium text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {creation.userPromptText || '✨ A magical creation without words!'}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-neutral-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(creation.timestamp).toLocaleDateString()}
          </div>
          {creation.bedtimeStoryText && (
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-primary font-bold">📖 Story</span>
            </div>
          )}
        </div>

        {/* Story Preview */}
        {creation.bedtimeStoryText && (
          <div className="glass-surface p-4 rounded-2xl border-2 border-purple-200/50">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 line-clamp-3">
              {creation.bedtimeStoryText.substring(0, 120)}...
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-primary/20">
        <motion.button
          onClick={handleView}
          className="btn-ghost text-base font-bold flex items-center gap-2 text-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Eye className="w-4 h-4" />
          👀 View
        </motion.button>
        
        {(creation.enhancedImageUrl || creation.originalImageUrl) && (
          <motion.button
            onClick={handleDownload}
            className="btn-ghost text-base font-bold flex items-center gap-2 text-success"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            💾 Save
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default function MyCreationsPage() {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, enhanced, stories
  const router = useRouter();
  const haptic = useHapticFeedback();

  useEffect(() => {
    const fetchCreations = async () => {
      setLoading(true);
      setError(null);
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          router.push('/login');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/creations/my-creations`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setCreations(data.creations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        } else {
          setError(data.error || 'Failed to fetch creations.');
        }
      } catch (err) {
        console.error('Error fetching creations:', err);
        setError('An unexpected error occurred: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCreations();
  }, [router]);

  const handleViewCreation = (creationId) => {
    // For now, we'll just log the ID. Later, we can navigate to a detailed view.
    console.log('View creation:', creationId);
    // You might navigate to a dynamic route like /creations/[creationId]
    // router.push(`/creations/${creationId}`);
  };

  const handleDownloadCreation = (url, filename) => {
    haptic.success();
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'creation.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCreations = creations.filter(creation => {
    switch (filter) {
      case 'enhanced':
        return creation.enhancedImageUrl;
      case 'stories':
        return creation.bedtimeStoryText;
      default:
        return true;
    }
  });

  const stats = {
    total: creations.length,
    enhanced: creations.filter(c => c.enhancedImageUrl).length,
    stories: creations.filter(c => c.bedtimeStoryText).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <MagicalLoadingSpinner message="🎨 Loading your amazing creations..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 transition-colors duration-300">
      <Head>
        <title>📚 My Magical Stories - Drawing Studio</title>
        <meta name="description" content="View and manage your amazing AI-enhanced drawings and magical stories!" />
      </Head>

      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 glass-surface border-b-4 border-primary/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => router.push('/')}
                className="btn-ghost flex items-center gap-2 font-bold text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4" />
                🏠 Back to Magic Studio
              </motion.button>
              
              <div className="h-8 w-1 bg-primary/30 rounded-full" />
              
              <div>
                <h1 className="text-2xl font-display font-bold rainbow-text">
                  📚 My Magical Stories
                </h1>
                <p className="text-base font-medium text-neutral-600 dark:text-neutral-400">
                  ✨ {stats.total} magical creation{stats.total !== 1 ? 's' : ''} ✨
                </p>
              </div>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        {error ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass-card max-w-md mx-auto border-4 border-error/30">
              <div className="text-error mb-6">
                <span className="text-6xl">😅</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                Oops! Something went wrong! 😅
              </h2>
              <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-8">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="magical-button text-lg font-bold"
              >
                🔄 Try Again
              </button>
            </div>
          </motion.div>
        ) : creations.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass-card max-w-lg mx-auto border-4 border-primary/30">
              <motion.div
                className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-magical"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-200 mb-6">
                🌟 Start Your Magical Journey! 🌟
              </h2>
              <p className="text-xl font-medium text-neutral-600 dark:text-neutral-400 mb-10">
                You haven't created any magical stories yet! Upload your first drawing and watch the magic happen! ✨
              </p>
              
              <motion.button
                onClick={() => router.push('/')}
                className="magical-button flex items-center gap-3 mx-auto text-xl font-bold py-4 px-8"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-6 h-6" />
                🎨 Create Your First Masterpiece!
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Stats & Filters */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="glass-card border-4 border-primary/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  {/* Stats */}
                  <div className="flex gap-6">
                    <div className="text-center">
                      <motion.div 
                        className="text-4xl font-display font-bold text-primary"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {stats.total}
                      </motion.div>
                      <div className="text-base font-bold text-neutral-600 dark:text-neutral-400">🎨 Total</div>
                    </div>
                    <div className="text-center">
                      <motion.div 
                        className="text-4xl font-display font-bold text-secondary"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, delay: 0.2, repeat: Infinity }}
                      >
                        {stats.enhanced}
                      </motion.div>
                      <div className="text-base font-bold text-neutral-600 dark:text-neutral-400">✨ Enhanced</div>
                    </div>
                    <div className="text-center">
                      <motion.div 
                        className="text-4xl font-display font-bold text-success"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, delay: 0.4, repeat: Infinity }}
                      >
                        {stats.stories}
                      </motion.div>
                      <div className="text-base font-bold text-neutral-600 dark:text-neutral-400">📖 Stories</div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: '🎨 All', emoji: '🎨' },
                      { key: 'enhanced', label: '✨ Enhanced', emoji: '✨' },
                      { key: 'stories', label: '📖 Stories', emoji: '📖' },
                    ].map(({ key, label }) => (
                      <motion.button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`
                          px-6 py-3 rounded-2xl text-base font-bold transition-all duration-300 border-2
                          ${filter === key
                            ? 'bg-primary text-white shadow-magical border-primary'
                            : 'glass-surface text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border-transparent hover:border-primary/30'
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Creations Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              layout
            >
              <AnimatePresence>
                {filteredCreations.map((creation, index) => (
                  <motion.div
                    key={creation.creationId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <CreationCard
                      creation={creation}
                      onView={handleViewCreation}
                      onDownload={handleDownloadCreation}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty Filter State */}
            {filteredCreations.length === 0 && filter !== 'all' && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="glass-card max-w-lg mx-auto border-4 border-yellow-300/30">
                  <motion.div 
                    className="text-6xl mb-6"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🔍
                  </motion.div>
                  <h3 className="text-2xl font-display font-bold text-neutral-800 dark:text-neutral-200 mb-4">
                    No {filter === 'enhanced' ? '✨ enhanced' : filter === 'stories' ? '📖 story' : ''} creations found! 😅
                  </h3>
                  <p className="text-lg font-medium text-neutral-600 dark:text-neutral-400 mb-8">
                    Try a different filter or create more magical content! ✨
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="btn-secondary text-lg font-bold py-3 px-6"
                  >
                    🎨 Show All My Creations
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Floating magical elements */}
        {['✨', '🌟', '💫', '⭐', '🎨', '🌈', '🦄', '🧚‍♀️', '📖', '🎭'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 4 + i,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {emoji}
          </motion.div>
        ))}
        
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [-50, 50, -50],
            y: [-50, 50, -50]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
}