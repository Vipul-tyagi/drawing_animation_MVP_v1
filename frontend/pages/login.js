import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const haptic = useHapticFeedback();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    haptic.light();

    const endpoint = isRegisterMode ? 'register' : 'login';

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegisterMode) {
          haptic.success();
          setError(null);
          setIsRegisterMode(false);
          // Show success message or auto-switch to login
        } else {
          haptic.success();
          localStorage.setItem('authToken', data.token);
          router.push('/');
        }
      } else {
        haptic.error();
        setError(data.error || `${isRegisterMode ? 'Registration' : 'Login'} failed.`);
      }
    } catch (err) {
      haptic.error();
      console.error(`${isRegisterMode ? 'Registration' : 'Login'} error:`, err);
      setError(`An unexpected error occurred during ${isRegisterMode ? 'registration' : 'login'}.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    haptic.light();
    setIsRegisterMode(!isRegisterMode);
    setError(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 flex items-center justify-center p-4 relative overflow-hidden">
      <Head>
        <title>{isRegisterMode ? '🎨 Join the Magic!' : '✨ Welcome Back!'} - Magical Drawing Studio</title>
        <meta name="description" content="Join thousands of families creating magical stories from drawings!" />
      </Head>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating magical elements */}
        {['✨', '🌟', '💫', '⭐', '🎨', '🌈', '🦄', '🧚‍♀️', '🎭', '📖'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 5 + i,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {emoji}
          </motion.div>
        ))}
        
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"
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
      </div>

      <motion.div
        className="glass-card w-full max-w-lg relative z-10 border-4 border-primary/30"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-magical"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-display font-bold rainbow-text">Magical Drawing Studio</h1>
              <p className="text-sm text-neutral-400 font-medium">Where dreams come to life! ✨</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h2 className="text-3xl font-display font-bold text-white mb-3">
              {isRegisterMode ? '🎨 Join the Magic!' : '✨ Welcome Back!'}
            </h2>
            <p className="text-lg font-medium text-neutral-300">
              {isRegisterMode 
                ? 'Join thousands of families creating magical stories! 🌟'
                : 'Ready to create more magical stories? 🚀'
              }
            </p>
          </motion.div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 p-4 bg-error/20 border-4 border-error/30 rounded-2xl"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">😅</span>
                <p className="text-error text-base font-bold">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <label htmlFor="email" className="block text-lg font-bold text-neutral-200 mb-3">
              📧 Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="email"
                id="email"
                className="input-field pl-12 bg-white/10 border-4 border-white/20 text-white placeholder:text-neutral-300 text-lg font-medium rounded-2xl"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <label htmlFor="password" className="block text-lg font-bold text-neutral-200 mb-3">
              🔒 Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-field pl-12 pr-12 bg-white/10 border-4 border-white/20 text-white placeholder:text-neutral-300 text-lg font-medium rounded-2xl"
                placeholder="Your secret password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-6 w-6 text-neutral-400 hover:text-neutral-300" />
                ) : (
                  <Eye className="h-6 w-6 text-neutral-400 hover:text-neutral-300" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
          className="w-full magical-button flex items-center justify-center gap-3 relative overflow-hidden text-xl font-bold py-4"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  {isRegisterMode ? '🎨 Creating Your Magic Account...' : '✨ Signing You In...'}
                </motion.div>
              ) : (
                <motion.div
                  key="submit"
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="text-2xl">{isRegisterMode ? '🎨' : '✨'}</span>
                  {isRegisterMode ? 'Join the Magic!' : 'Let\'s Create!'}
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>

            {!loading && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
            )}
          </motion.button>
        </form>

        {/* Toggle Mode */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <p className="text-neutral-300 text-lg font-medium">
            {isRegisterMode ? 'Already part of our magical family?' : "New to our magical world?"}
          </p>
          <motion.button
            type="button"
            onClick={toggleMode}
            className="mt-3 text-primary hover:text-secondary font-bold text-lg transition-colors duration-200"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isRegisterMode ? '✨ Sign In Instead' : '🎨 Join the Magic!'}
          </motion.button>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          className="mt-8 pt-6 border-t-4 border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <p className="text-neutral-300 text-lg font-bold text-center mb-6">🌟 What magical features await you:</p>
          <div className="grid grid-cols-2 gap-4 text-base font-medium">
            <div className="flex items-center gap-2 text-neutral-300">
              <div className="w-4 h-4 bg-primary rounded-full shadow-magical"></div>
              🤖 AI Story Magic
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <div className="w-4 h-4 bg-secondary rounded-full shadow-magical"></div>
              ✨ Art Enhancement
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <div className="w-4 h-4 bg-success rounded-full shadow-magical"></div>
              💾 Save Forever
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <div className="w-4 h-4 bg-warning rounded-full shadow-magical"></div>
              📤 Share Joy
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}