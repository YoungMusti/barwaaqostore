import { useState, useRef, MouseEvent } from 'react';
import { motion } from 'framer-motion';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPosition({ x, y });
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden cursor-zoom-in ${className}`}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        animate={{
          scale: isZoomed ? 2 : 1,
          transformOrigin: `${position.x}% ${position.y}%`,
        }}
        transition={{ duration: 0.1 }}
      />
    </motion.div>
  );
}
