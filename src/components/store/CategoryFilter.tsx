import { Category } from '@/types/database';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { Tag, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  showSaleOnly?: boolean;
  onSaleSelect?: () => void;
  saleCount?: number;
  categoryStockMap?: Record<string, number>;
}

export function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  showSaleOnly = false,
  onSaleSelect,
  saleCount = 0,
  categoryStockMap = {}
}: CategoryFilterProps) {
  const { t, language } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap gap-2 justify-center"
    >
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectCategory(null)}
        className={cn(
          "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
          selectedCategory === null && !showSaleOnly
            ? "bg-primary text-primary-foreground shadow-warm"
            : "bg-secondary text-secondary-foreground hover:bg-primary/10"
        )}
      >
        <Sparkles className="w-3.5 h-3.5" />
        {t('allProducts')}
      </motion.button>

      {/* Sale section */}
      {saleCount > 0 && onSaleSelect && (
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSaleSelect}
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden",
            showSaleOnly
              ? "bg-destructive text-destructive-foreground shadow-warm"
              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
          )}
        >
          {/* Pulse animation for sale */}
          {!showSaleOnly && (
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-destructive/20"
            />
          )}
          <Tag className="w-4 h-4 relative z-10" />
          <span className="relative z-10">{t('sale')} ({saleCount})</span>
        </motion.button>
      )}

      {categories.map((category, index) => {
        const hasStock = (categoryStockMap[category.id] || 0) > 0;
        const isDisabled = !category.enabled;
        const isHidden = isDisabled || !hasStock;
        
        // Auto-hide categories with no stock or disabled
        if (isHidden) {
          return (
            <motion.button
              key={category.id}
              variants={itemVariants}
              disabled
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-muted text-muted-foreground/50 cursor-not-allowed line-through"
            >
              {language === 'so' ? category.name_somali : category.name}
              {!hasStock && ' (0)'}
            </motion.button>
          );
        }
        
        return (
          <motion.button
            key={category.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground shadow-warm"
                : "bg-secondary text-secondary-foreground hover:bg-primary/10"
            )}
          >
            {language === 'so' ? category.name_somali : category.name}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
