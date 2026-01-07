import { Category } from '@/types/database';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';

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

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
          selectedCategory === null && !showSaleOnly
            ? "bg-primary text-primary-foreground shadow-warm"
            : "bg-secondary text-secondary-foreground hover:bg-primary/10"
        )}
      >
        {t('allProducts')}
      </button>

      {/* Sale section */}
      {saleCount > 0 && onSaleSelect && (
        <button
          onClick={onSaleSelect}
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
            showSaleOnly
              ? "bg-destructive text-destructive-foreground shadow-warm"
              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
          )}
        >
          <Tag className="w-4 h-4" />
          {t('sale')} ({saleCount})
        </button>
      )}

      {categories.map(category => {
        const hasStock = (categoryStockMap[category.id] || 0) > 0;
        const isDisabled = !category.enabled;
        const isHidden = isDisabled || !hasStock;
        
        // Auto-hide categories with no stock or disabled
        if (isHidden) {
          return (
            <button
              key={category.id}
              disabled
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-muted text-muted-foreground/50 cursor-not-allowed line-through"
            >
              {language === 'so' ? category.name_somali : category.name}
              {!hasStock && ' (0)'}
            </button>
          );
        }
        
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground shadow-warm"
                : "bg-secondary text-secondary-foreground hover:bg-primary/10"
            )}
          >
            {language === 'so' ? category.name_somali : category.name}
          </button>
        );
      })}
    </div>
  );
}