import { motion } from 'framer-motion';
import { Flame, Sparkles, Clock, Zap } from 'lucide-react';

interface ProductBadgeProps {
  type: 'new' | 'hot' | 'limited' | 'trending';
}

const badgeConfig = {
  new: {
    label: 'NEW',
    icon: Sparkles,
    className: 'bg-emerald-500 text-white',
  },
  hot: {
    label: 'HOT',
    icon: Flame,
    className: 'bg-orange-500 text-white',
  },
  limited: {
    label: 'LIMITED',
    icon: Clock,
    className: 'bg-purple-500 text-white',
  },
  trending: {
    label: 'TRENDING',
    icon: Zap,
    className: 'bg-blue-500 text-white',
  },
};

export function ProductBadge({ type }: ProductBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -12 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </motion.div>
  );
}

// Determine badge type based on product data
export function getProductBadgeType(product: { created_at: string; stock: number; is_on_sale: boolean }): 'new' | 'hot' | 'limited' | 'trending' | null {
  const daysSinceCreated = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceCreated <= 7) return 'new';
  if (product.stock > 0 && product.stock <= 3) return 'limited';
  if (product.is_on_sale) return 'hot';
  return null;
}
