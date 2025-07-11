import { useEffect, useRef } from 'react';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0
    };
    
    this.observers = [];
    this.init();
  }

  init() {
    // Performance Observer for Web Vitals
    if ('PerformanceObserver' in window) {
      this.observeWebVitals();
    }

    // Page Load Time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.reportMetric('page_load_time', this.metrics.pageLoadTime);
    });

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.reportMetric('memory_usage', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      }, 30000); // Every 30 seconds
    }
  }

  observeWebVitals() {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
          this.reportMetric('first_contentful_paint', entry.startTime);
        }
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(fcpObserver);

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lastEntry.startTime;
      this.reportMetric('largest_contentful_paint', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.metrics.cumulativeLayoutShift = clsValue;
      this.reportMetric('cumulative_layout_shift', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        this.reportMetric('first_input_delay', this.metrics.firstInputDelay);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);
  }

  reportMetric(name, value) {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}:`, value);
    }

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics, DataDog, etc.
      if (typeof gtag !== 'undefined') {
        gtag('event', 'performance_metric', {
          metric_name: name,
          metric_value: typeof value === 'number' ? Math.round(value) : value,
          custom_parameter: window.location.pathname
        });
      }
    }

    // Store in session storage for debugging
    try {
      const existingMetrics = JSON.parse(sessionStorage.getItem('performance_metrics') || '{}');
      existingMetrics[name] = value;
      existingMetrics.timestamp = Date.now();
      sessionStorage.setItem('performance_metrics', JSON.stringify(existingMetrics));
    } catch (e) {
      // Ignore storage errors
    }
  }

  measureUserTiming(name, startMark, endMark) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      this.reportMetric(`user_timing_${name}`, measure.duration);
      return measure.duration;
    } catch (e) {
      console.warn('Performance measurement failed:', e);
      return 0;
    }
  }

  markStart(name) {
    try {
      performance.mark(`${name}_start`);
    } catch (e) {
      console.warn('Performance mark failed:', e);
    }
  }

  markEnd(name) {
    try {
      performance.mark(`${name}_end`);
      return this.measureUserTiming(name, `${name}_start`, `${name}_end`);
    } catch (e) {
      console.warn('Performance mark failed:', e);
      return 0;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
let performanceMonitor = null;

export const usePerformanceMonitor = () => {
  const monitorRef = useRef(null);

  useEffect(() => {
    if (!performanceMonitor) {
      performanceMonitor = new PerformanceMonitor();
    }
    monitorRef.current = performanceMonitor;

    return () => {
      // Don't destroy on unmount as it's a singleton
    };
  }, []);

  const markStart = (name) => {
    monitorRef.current?.markStart(name);
  };

  const markEnd = (name) => {
    return monitorRef.current?.markEnd(name) || 0;
  };

  const reportCustomMetric = (name, value) => {
    monitorRef.current?.reportMetric(name, value);
  };

  const getMetrics = () => {
    return monitorRef.current?.getMetrics() || {};
  };

  return {
    markStart,
    markEnd,
    reportCustomMetric,
    getMetrics
  };
};

export default PerformanceMonitor;