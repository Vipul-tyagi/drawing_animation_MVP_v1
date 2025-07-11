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
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4 relative overflow-hidden">
      <Head>
        <title>{isRegisterMode ? 'Sign Up' : 'Sign In'} - Drawing to Animation</title>
        <meta name="description" content="Access your creative studio" />
      </Head>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"
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

      <motion.div
        className="glass-card w-full max-w-md relative z-10"
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
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Drawing Studio</h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <h2 className="text-headline text-white mb-2">
              {isRegisterMode ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-body text-neutral-400">
              {isRegisterMode 
                ? 'Join thousands of creators bringing their drawings to life'
                : 'Sign in to continue your creative journey'
              }
            </p>
          </motion.div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-error text-sm font-medium">{error}</p>
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
            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="email"
                id="email"
                className="input-field pl-10 bg-neutral-800/50 border-neutral-600 text-white placeholder:text-neutral-500"
                placeholder="Enter your email"
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
            <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-field pl-10 pr-10 bg-neutral-800/50 border-neutral-600 text-white placeholder:text-neutral-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-300" />
                ) : (
                  <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-300" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full btn-primary flex items-center justify-center gap-3 relative overflow-hidden"
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
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  {isRegisterMode ? 'Creating Account...' : 'Signing In...'}
                </motion.div>
              ) : (
                <motion.div
                  key="submit"
                  className="flex items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {isRegisterMode ? 'Create Account' : 'Sign In'}
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
          <p className="text-neutral-400 text-sm">
            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <motion.button
            type="button"
            onClick={toggleMode}
            className="mt-2 text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isRegisterMode ? 'Sign In' : 'Create Account'}
          </motion.button>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          className="mt-8 pt-6 border-t border-neutral-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <p className="text-neutral-400 text-xs text-center mb-4">What you'll get:</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              AI Story Generation
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              Image Enhancement
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              Save Creations
            </div>
            <div className="flex items-center gap-2 text-neutral-300">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              Share & Export
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}