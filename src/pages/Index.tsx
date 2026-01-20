import { useState, useEffect } from 'react';
import { Header } from '@/components/store/Header';
import { HeroSection } from '@/components/store/HeroSection';
import { TrustSignals } from '@/components/store/TrustSignals';
import { CategoryFilter } from '@/components/store/CategoryFilter';
import { CategoryQuickLinks } from '@/components/store/CategoryQuickLinks';
import { ProductCard } from '@/components/store/ProductCard';
import { ProductDetailModal } from '@/components/store/ProductDetailModal';
import { CartDrawer } from '@/components/store/CartDrawer';
import { Footer } from '@/components/store/Footer';
import { FloatingWhatsApp } from '@/components/store/FloatingWhatsApp';
import { RecentlyViewedSection } from '@/components/store/RecentlyViewedSection';
import { BackToTop } from '@/components/store/BackToTop';
import { LoadingBar } from '@/components/store/LoadingBar';
import { StickyCartBar } from '@/components/store/StickyCartBar';
import { FAQSection } from '@/components/store/FAQSection';
import { SocialProofPopup } from '@/components/store/SocialProofPopup';
import { LiveChatIndicator } from '@/components/store/LiveChatIndicator';
import { SaleCountdownBanner } from '@/components/store/SaleCountdownBanner';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types/database';
import { Package } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { ProductGridSkeleton } from '@/components/store/ProductCardSkeleton';
import { motion } from 'framer-motion';

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const { t } = useLanguage();
  const { addItem: addToRecentlyViewed } = useRecentlyViewed();

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

  // Calculate stock per category
  const categoryStockMap = categories.reduce((acc, cat) => {
    const totalStock = products
      .filter(p => p.category_id === cat.id)
      .reduce((sum, p) => sum + p.stock, 0);
    acc[cat.id] = totalStock;
    return acc;
  }, {} as Record<string, number>);

  const filteredProducts = products.filter(p => {
    if (showSaleOnly && !p.is_on_sale) return false;
    if (selectedCategory) {
      return p.category_id === selectedCategory;
    }
    const cat = categories.find(c => c.id === p.category_id);
    if (!cat) return true;
    return cat.enabled && categoryStockMap[cat.id] > 0;
  });

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setShowSaleOnly(false);
  };

  const handleHeroCategorySelect = (categorySearch: string) => {
    const cat = categories.find(c => 
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
    if (cat) {
      setSelectedCategory(cat.id);
      setShowSaleOnly(false);
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaleSelect = () => {
    setShowSaleOnly(!showSaleOnly);
    setSelectedCategory(null);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    addToRecentlyViewed(product);
  };

  const saleCount = products.filter(p => p.is_on_sale).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LoadingBar isLoading={isLoading} />
      <SaleCountdownBanner />
      <Header onProductClick={handleProductClick} />
      <HeroSection onCategorySelect={handleHeroCategorySelect} />
      <TrustSignals />
      
      <CategoryQuickLinks 
        categories={categories}
        onSelectCategory={handleCategorySelect}
        categoryStockMap={categoryStockMap}
      />

      <main id="products-section" className="container py-12 flex-1">
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            showSaleOnly={showSaleOnly}
            onSaleSelect={handleSaleSelect}
            saleCount={saleCount}
            categoryStockMap={categoryStockMap}
          />
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{t('allProducts')}</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard 
                  product={product} 
                  index={index} 
                  onClick={() => handleProductClick(product)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <RecentlyViewedSection onProductClick={handleProductClick} />
      <FAQSection />
      <Footer />
      <CartDrawer />
      <ProductDetailModal 
        product={selectedProduct} 
        open={showProductModal} 
        onOpenChange={setShowProductModal} 
      />
      <FloatingWhatsApp />
      <BackToTop />
      <StickyCartBar />
      <SocialProofPopup />
      <LiveChatIndicator />
    </div>
  );
}
