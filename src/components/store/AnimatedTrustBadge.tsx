import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AnimatedTrustBadgeProps {
  icon: LucideIcon;
  label: string;
  tooltip: string;
  index: number;
}

export function AnimatedTrustBadge({ icon: Icon, label, tooltip, index }: AnimatedTrustBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.4 }}
          whileHover={{ scale: 1.05, y: -2 }}
          className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer"
        >
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-success/20"
          >
            <Icon className="w-3 h-3 text-success" />
          </motion.span>
          <span className="font-medium">{label}</span>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
