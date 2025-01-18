import React from 'react';
import classNames from 'classnames';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export function Image({ src, alt, className, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  React.useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Cleanup observer after image comes into view
          if (observerRef.current && imgRef.current) {
            observerRef.current.unobserve(imgRef.current);
            observerRef.current.disconnect();
            observerRef.current = null;
          }
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className="relative">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />
      )}
      <img
        ref={imgRef}
        src={isInView ? src : ''}
        alt={alt}
        className={classNames(
          'transition-opacity duration-300',
          {
            'opacity-0': !isLoaded,
            'opacity-100': isLoaded
          },
          className
        )}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
}