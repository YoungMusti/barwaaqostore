import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Package } from 'lucide-react';

interface LazyImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function LazyImage({ src, alt, className, fallbackClassName }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  if (!src || hasError) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-secondary/50", fallbackClassName)}>
        <Package className="w-16 h-16 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Placeholder/Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-secondary/50 animate-pulse" />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        loading="lazy"
      />
    </div>
  );
}
