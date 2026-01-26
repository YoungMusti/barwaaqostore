import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedFiltersProps {
  minPrice: number;
  maxPrice: number;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onReset: () => void;
}

export function AdvancedFilters({
  minPrice,
  maxPrice,
  priceRange,
  onPriceChange,
  sortBy,
  onSortChange,
  onReset,
}: AdvancedFiltersProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'default', labelEn: 'Default', labelSo: 'Caadi' },
    { value: 'price-low', labelEn: 'Price: Low to High', labelSo: 'Qiimaha: Hoose-Sare' },
    { value: 'price-high', labelEn: 'Price: High to Low', labelSo: 'Qiimaha: Sare-Hoose' },
    { value: 'newest', labelEn: 'Newest First', labelSo: 'Cusub Hordhac' },
    { value: 'name', labelEn: 'Name A-Z', labelSo: 'Magaca A-Z' },
  ];

  const hasActiveFilters = 
    priceRange[0] !== minPrice || 
    priceRange[1] !== maxPrice || 
    sortBy !== 'default';

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Filter toggle button */}
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "gap-2 rounded-full",
            hasActiveFilters && "border-primary text-primary"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {language === 'so' ? 'Shaandhayn' : 'Filters'}
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </Button>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {language === 'so' ? 'Kala sooc:' : 'Sort by:'}
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-2 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {language === 'so' ? option.labelSo : option.labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expandable filters panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">
                  {language === 'so' ? 'Xulasho Qiime' : 'Price Range'}
                </h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="text-muted-foreground hover:text-foreground gap-1"
                  >
                    <X className="w-3 h-3" />
                    {language === 'so' ? 'Dib u deji' : 'Reset'}
                  </Button>
                )}
              </div>

              {/* Price Range Slider */}
              <div className="space-y-4">
                <Slider
                  value={priceRange}
                  min={minPrice}
                  max={maxPrice}
                  step={5}
                  onValueChange={(value) => onPriceChange(value as [number, number])}
                  className="w-full"
                />
                
                <div className="flex items-center justify-between text-sm">
                  <div className="px-3 py-1.5 bg-secondary rounded-lg">
                    <span className="text-muted-foreground">Min: </span>
                    <span className="font-semibold">${priceRange[0]}</span>
                  </div>
                  <div className="h-px flex-1 bg-border mx-4" />
                  <div className="px-3 py-1.5 bg-secondary rounded-lg">
                    <span className="text-muted-foreground">Max: </span>
                    <span className="font-semibold">${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
