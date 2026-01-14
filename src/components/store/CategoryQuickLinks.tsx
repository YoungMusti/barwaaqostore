import { Category } from '@/types/database';
import { useLanguage } from '@/hooks/useLanguage';

interface CategoryQuickLinksProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
  categoryStockMap: Record<string, number>;
}

export function CategoryQuickLinks({ categories, onSelectCategory, categoryStockMap }: CategoryQuickLinksProps) {
  const { language } = useLanguage();

  // Filter to only show enabled categories with stock
  const visibleCategories = categories.filter(cat => cat.enabled && categoryStockMap[cat.id] > 0);

  if (visibleCategories.length === 0) return null;

  return (
    <section className="container py-8">
      <h2 className="font-display text-xl font-bold mb-4">
        {language === 'so' ? 'Raadi Noocyada' : 'Shop by Category'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visibleCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border hover:border-primary/30 transition-all p-6 text-left"
          >
            <div className="relative z-10">
              <h3 className="font-display font-semibold text-lg mb-1">
                {language === 'so' ? category.name_somali : category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {categoryStockMap[category.id]} {language === 'so' ? 'alaab' : 'items'}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
          </button>
        ))}
      </div>
    </section>
  );
}
