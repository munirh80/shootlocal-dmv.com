import React, { useState, useRef, useEffect } from 'react';

/**
 * LazyImage component with intersection observer for lazy loading
 * Falls back to native loading="lazy" if IntersectionObserver is not supported
 */
const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  onLoad = () => {},
  onError = () => {},
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before image enters viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setHasError(true);
    onError();
  };

  // Default placeholder - a simple gray gradient
  const defaultPlaceholder = (
    <div 
      className={`bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 animate-pulse ${className}`}
      style={{ minHeight: '200px' }}
    />
  );

  if (hasError) {
    return (
      <div 
        className={`bg-slate-200 dark:bg-slate-700 flex items-center justify-center ${className}`}
        style={{ minHeight: '200px' }}
      >
        <span className="text-slate-500 dark:text-slate-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className="relative">
      {/* Show placeholder until image loads */}
      {!isLoaded && (placeholder || defaultPlaceholder)}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
          style={{ transition: 'opacity 0.3s ease-in-out' }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
