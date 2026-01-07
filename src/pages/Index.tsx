import { useState, useEffect } from 'react';
import { Header } from '@/components/store/Header';
import { HeroSection } from '@/components/store/HeroSection';
import { CategoryFilter } from '@/components/store/CategoryFilter';
import { ProductCard } from '@/components/store/ProductCard';
import { CartDrawer } from '@/components/store/CartDrawer';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types/database';
import { Loader2, Package } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchData() {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)'),
        supabase.from('categories').select('*'),
      ]);

      if (productsRes.data) setProducts(productsRes.data as Product[]);
      if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    // Filter by sale if selected
    if (showSaleOnly && !p.is_on_sale) return false;
    
    // Filter by category if selected
    if (selectedCategory) {
      return p.category_id === selectedCategory;
    }
    
    // If no category selected, show products from enabled categories
    const cat = categories.find(c => c.id === p.category_id);
    return !cat || cat.enabled;
  });

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setShowSaleOnly(false);
  };

  const handleSaleSelect = () => {
    setShowSaleOnly(!showSaleOnly);
    setSelectedCategory(null);
  };

  // Count sale items
  const saleCount = products.filter(p => p.is_on_sale).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />

      <main className="container py-12">
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            showSaleOnly={showSaleOnly}
            onSaleSelect={handleSaleSelect}
            saleCount={saleCount}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('allProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </main>

      <CartDrawer />
    </div>
  );
}