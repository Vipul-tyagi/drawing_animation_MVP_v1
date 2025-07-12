import { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

const NotificationItem = ({ notification, onDismiss }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertTriangle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const colors = {
    success: 'bg-success/10 border-success/20 text-success',
    error: 'bg-error/10 border-error/20 text-error',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    info: 'bg-primary/10 border-primary/20 text-primary'
  };

  useEffect(() => {
    if (notification.autoClose !== false) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  return (
    <div
      className={`
        glass-surface border rounded-xl p-4 shadow-lg max-w-sm w-full
        ${colors[notification.type]}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[notification.type]}
        </div>
        
        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              {notification.title}
            </h4>
          )}
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {notification.message}
          </p>
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium hover:underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onDismiss(notification.id)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar for auto-close */}
      {notification.autoClose !== false && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-xl"
        />
      )}
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      autoClose: true,
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const success = (message, options = {}) => {
    return addNotification({ ...options, message, type: 'success' });
  };

  const error = (message, options = {}) => {
    return addNotification({ 
      ...options, 
      message, 
      type: 'error', 
      autoClose: false // Errors should be manually dismissed
    });
  };

  const warning = (message, options = {}) => {
    return addNotification({ ...options, message, type: 'warning' });
  };

  const info = (message, options = {}) => {
    return addNotification({ ...options, message, type: 'info' });
  };

  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Smart notification hooks for common scenarios
export const useSmartNotifications = () => {
  const { success, error, warning, info } = useNotifications();

  const notifyUploadSuccess = (filename) => {
    success(`${filename} uploaded successfully!`, {
      title: 'Upload Complete',
      duration: 3000
    });
  };

  const notifyUploadError = (errorMessage) => {
    error(`Upload failed: ${errorMessage}`, {
      title: 'Upload Error',
      action: {
        label: 'Try Again',
        onClick: () => window.location.reload()
      }
    });
  };

  const notifyProcessingStart = () => {
    info('Your drawing is being processed...', {
      title: 'Processing Started',
      duration: 3000
    });
  };

  const notifyProcessingComplete = () => {
    success('Your masterpiece is ready!', {
      title: 'Processing Complete',
      duration: 4000
    });
  };

  const notifyNetworkError = () => {
    error('Please check your internet connection and try again.', {
      title: 'Connection Error',
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    });
  };

  const notifyFeatureComingSoon = (feature) => {
    info(`${feature} is coming soon! Stay tuned for updates.`, {
      title: 'Coming Soon',
      duration: 4000
    });
  };

  return {
    notifyUploadSuccess,
    notifyUploadError,
    notifyProcessingStart,
    notifyProcessingComplete,
    notifyNetworkError,
    notifyFeatureComingSoon,
    success,
    error,
    warning,
    info
  };
};