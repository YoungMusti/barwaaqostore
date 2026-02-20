import { LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProductGridToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  count: number;
}

export function ProductGridToggle({ view, onViewChange, count }: ProductGridToggleProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{count}</span> products
      </p>
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('grid')}
          className={cn(
            'p-2 rounded-md transition-colors',
            view === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
          )}
        >
          <LayoutGrid className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewChange('list')}
          className={cn(
            'p-2 rounded-md transition-colors',
            view === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
          )}
        >
          <List className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
