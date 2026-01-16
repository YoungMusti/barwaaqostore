import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export function GradientText({ children, className, animated = true }: GradientTextProps) {
  return (
    <motion.span
      className={cn(
        "bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto]",
        animated && "animate-gradient-flow",
        className
      )}
      initial={animated ? { backgroundPosition: '0% center' } : undefined}
      animate={animated ? { backgroundPosition: ['0% center', '100% center', '0% center'] } : undefined}
      transition={animated ? { duration: 5, repeat: Infinity, ease: 'linear' } : undefined}
    >
      {children}
    </motion.span>
  );
}
