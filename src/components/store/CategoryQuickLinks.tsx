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

  const gradients = [
    'from-primary/15 via-primary/5 to-accent/10',
    'from-accent/15 via-accent/5 to-success/10',
    'from-success/10 via-primary/5 to-primary/15',
    'from-warning/10 via-accent/5 to-primary/10',
  ];

  return (
    <section className="container py-10">
      <h2 className="font-display text-2xl font-bold mb-6 text-gradient-warm inline-block">
        {language === 'so' ? 'Raadi Noocyada' : 'Shop by Category'}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visibleCategories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[index % gradients.length]} border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 p-6 text-left`}
          >
            <div className="relative z-10">
              <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                {language === 'so' ? category.name_somali : category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {categoryStockMap[category.id]} {language === 'so' ? 'alaab' : 'items'}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500 blur-sm" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-accent/15 to-transparent rounded-full translate-y-1/2 -translate-x-1/4 group-hover:scale-125 transition-transform duration-700" />
          </button>
        ))}
      </div>
    </section>
  );
}
