import React from 'react';
import { RefreshCw, AlertTriangle, Home, MessageCircle } from 'lucide-react';

class SmartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportIssue = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // In production, this would send to your support system
    console.log('Error report:', errorDetails);
    
    // For now, copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    alert('Error details copied to clipboard. Please share with support.');
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.message?.includes('fetch') || 
                            this.state.error?.message?.includes('network');
      
      const isChunkError = this.state.error?.message?.includes('ChunkLoadError') ||
                          this.state.error?.message?.includes('Loading chunk');

      return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
          <div
            className="glass-card max-w-lg w-full text-center"
          >
            {/* Error Icon */}
            <div
              className="w-16 h-16 mx-auto mb-6 bg-error/10 rounded-full flex items-center justify-center"
            >
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
              {isChunkError ? 'Update Available' : 
               isNetworkError ? 'Connection Issue' : 
               'Something went wrong'}
            </h1>

            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {isChunkError ? 
                'The app has been updated. Please refresh to get the latest version.' :
               isNetworkError ? 
                'Please check your internet connection and try again.' :
                'An unexpected error occurred. Our team has been notified.'}
            </p>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-neutral-500 mb-2">
                  Technical Details
                </summary>
                <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-xs font-mono overflow-auto max-h-32">
                  <div className="text-error mb-2">{this.state.error.message}</div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    {this.state.error.stack}
                  </div>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="btn-primary flex items-center gap-2"
                disabled={this.state.retryCount >= 3}
              >
                <RefreshCw className="w-4 h-4" />
                {isChunkError ? 'Refresh Page' : 'Try Again'}
              </button>

              <button
                onClick={this.handleGoHome}
                className="btn-secondary flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>

              {!isChunkError && !isNetworkError && (
                <button
                  onClick={this.handleReportIssue}
                  className="btn-ghost flex items-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Report Issue
                </button>
              )}
            </div>

            {/* Retry Limit Message */}
            {this.state.retryCount >= 3 && (
              <p
                className="text-sm text-neutral-500 mt-4"
              >
                Maximum retry attempts reached. Please refresh the page or contact support.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SmartErrorBoundary;