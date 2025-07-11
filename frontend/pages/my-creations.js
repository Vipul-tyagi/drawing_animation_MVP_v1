import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Eye, Sparkles, Calendar, FileText, Image as ImageIcon, Plus } from 'lucide-react';

import LoadingSpinner from '../components/LoadingSpinner';
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
      className="card-interactive group"
      onClick={handleView}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-xl mb-4">
        {creation.enhancedImageUrl || creation.originalImageUrl ? (
          <>
            <img
              src={creation.enhancedImageUrl || creation.originalImageUrl}
              alt="Creation"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Enhanced Badge */}
            {creation.enhancedImageUrl && (
              <div className="absolute top-3 right-3 glass-surface px-2 py-1 rounded-lg">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-primary">Enhanced</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-neutral-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="text-title text-neutral-800 dark:text-neutral-200 mb-1">
            Creation #{creation.creationId.substring(0, 8)}
          </h3>
          <p className="text-caption text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {creation.userPromptText || 'No description provided'}
          </p>
        </div>

        <div className="flex items-center gap-4 text-caption text-neutral-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(creation.timestamp).toLocaleDateString()}
          </div>
          {creation.bedtimeStoryText && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Story
            </div>
          )}
        </div>

        {/* Story Preview */}
        {creation.bedtimeStoryText && (
          <div className="glass-surface p-3 rounded-lg">
            <p className="text-caption text-neutral-600 dark:text-neutral-400 line-clamp-3">
              {creation.bedtimeStoryText.substring(0, 120)}...
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <motion.button
          onClick={handleView}
          className="btn-ghost text-sm flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Eye className="w-4 h-4" />
          View
        </motion.button>
        
        {(creation.enhancedImageUrl || creation.originalImageUrl) && (
          <motion.button
            onClick={handleDownload}
            className="btn-ghost text-sm flex items-center gap-2 text-success"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            Download
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
        <LoadingSpinner message="Loading your creations..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
      <Head>
        <title>My Creations - Drawing to Animation</title>
        <meta name="description" content="View and manage your AI-enhanced drawings and stories" />
      </Head>

      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 glass-surface border-b border-neutral-200/50 dark:border-neutral-700/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => router.push('/')}
                className="btn-ghost flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Studio
              </motion.button>
              
              <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />
              
              <div>
                <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  My Creations
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {stats.total} creation{stats.total !== 1 ? 's' : ''}
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
            <div className="glass-card max-w-md mx-auto">
              <div className="text-error mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-title text-neutral-800 dark:text-neutral-200 mb-2">
                Something went wrong
              </h2>
              <p className="text-body text-neutral-600 dark:text-neutral-400 mb-6">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        ) : creations.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass-card max-w-md mx-auto">
              <motion.div
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-headline text-neutral-800 dark:text-neutral-200 mb-4">
                Start Your Creative Journey
              </h2>
              <p className="text-body text-neutral-600 dark:text-neutral-400 mb-8">
                You haven't created any masterpieces yet! Upload your first drawing to see the magic happen.
              </p>
              
              <motion.button
                onClick={() => router.push('/')}
                className="btn-primary flex items-center gap-3 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                Create Your First Drawing
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
              <div className="glass-card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  {/* Stats */}
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.total}</div>
                      <div className="text-caption text-neutral-600 dark:text-neutral-400">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">{stats.enhanced}</div>
                      <div className="text-caption text-neutral-600 dark:text-neutral-400">Enhanced</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{stats.stories}</div>
                      <div className="text-caption text-neutral-600 dark:text-neutral-400">Stories</div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'enhanced', label: 'Enhanced' },
                      { key: 'stories', label: 'Stories' },
                    ].map(({ key, label }) => (
                      <motion.button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${filter === key
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'glass-surface text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
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
                <div className="glass-card max-w-md mx-auto">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-title text-neutral-800 dark:text-neutral-200 mb-2">
                    No {filter} creations found
                  </h3>
                  <p className="text-body text-neutral-600 dark:text-neutral-400 mb-6">
                    Try a different filter or create more content.
                  </p>
                  <button
                    onClick={() => setFilter('all')}
                    className="btn-secondary"
                  >
                    Show All Creations
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
}