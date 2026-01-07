import { Category } from '@/types/database';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const { t, language } = useLanguage();

  const enabledCategories = categories.filter(cat => cat.enabled);

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
          selectedCategory === null
            ? "bg-primary text-primary-foreground shadow-warm"
            : "bg-secondary text-secondary-foreground hover:bg-primary/10"
        )}
      >
        {t('allProducts')}
      </button>
      {enabledCategories.map(category => (
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
      ))}
    </div>
  );
}
