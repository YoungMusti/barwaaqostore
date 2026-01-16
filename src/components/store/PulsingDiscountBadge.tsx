import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';

interface PulsingDiscountBadgeProps {
  discount: number;
  size?: 'sm' | 'md' | 'lg';
}

export function PulsingDiscountBadge({ discount, size = 'md' }: PulsingDiscountBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="relative"
    >
      {/* Pulsing ring */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-destructive"
      />
      
      <div className={`relative flex items-center gap-1 rounded-full bg-destructive text-destructive-foreground font-semibold ${sizeClasses[size]}`}>
        <Tag className="w-3 h-3" />
        <span>-{discount}%</span>
      </div>
    </motion.div>
  );
}
