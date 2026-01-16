import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

interface StockProgressBarProps {
  stock: number;
  maxStock?: number;
}

export function StockProgressBar({ stock, maxStock = 20 }: StockProgressBarProps) {
  const { language } = useLanguage();
  const percentage = Math.min((stock / maxStock) * 100, 100);
  
  const getColor = () => {
    if (stock === 0) return 'bg-destructive';
    if (stock <= 5) return 'bg-warning';
    return 'bg-success';
  };

  const getLabel = () => {
    if (stock === 0) return language === 'so' ? 'Dhammaad' : 'Out of stock';
    if (stock <= 5) return language === 'so' ? `${stock} oo haray` : `Only ${stock} left`;
    return language === 'so' ? 'Waa jiraa' : 'In stock';
  };

  return (
    <div className="space-y-1">
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${getColor()} rounded-full`}
        />
      </div>
      <p className="text-xs text-muted-foreground">{getLabel()}</p>
    </div>
  );
}
