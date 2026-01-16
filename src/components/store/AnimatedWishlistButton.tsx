import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedWishlistButtonProps {
  isActive: boolean;
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedWishlistButton({ isActive, onClick, className, size = 'md' }: AnimatedWishlistButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "rounded-full flex items-center justify-center transition-colors relative overflow-hidden",
        sizeClasses[size],
        isActive 
          ? "bg-destructive text-destructive-foreground" 
          : "bg-background/80 hover:bg-background text-foreground",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isActive ? (
          <motion.div
            key="active"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Heart className={cn(iconSizes[size], "fill-current")} />
          </motion.div>
        ) : (
          <motion.div
            key="inactive"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Heart className={iconSizes[size]} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Burst particles */}
      <AnimatePresence>
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1],
                  opacity: [1, 0],
                  x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 20,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute w-1.5 h-1.5 rounded-full bg-destructive"
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
