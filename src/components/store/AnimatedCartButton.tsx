import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedCartButton({ onClick, disabled, children, className }: AnimatedCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = () => {
    if (disabled || isAdded) return;
    
    onClick();
    setIsAdded(true);
    
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isAdded}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isAdded && "bg-success hover:bg-success",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isAdded ? (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
            >
              <Check className="w-5 h-5" />
            </motion.div>
            <span>Added!</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Ripple effect */}
      {isAdded && (
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-white rounded-full"
          style={{ transformOrigin: 'center' }}
        />
      )}
    </Button>
  );
}
