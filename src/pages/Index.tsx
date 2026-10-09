import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/store/Header';
import { HeroSection } from '@/components/store/HeroSection';
import { TrustSignals } from '@/components/store/TrustSignals';
import { CategoryFilter } from '@/components/store/CategoryFilter';
import { CategoryQuickLinks } from '@/components/store/CategoryQuickLinks';
import { ProductCard } from '@/components/store/ProductCard';
import { ProductListCard } from '@/components/store/ProductListCard';
import { ProductDetailModal } from '@/components/store/ProductDetailModal';
import { CartDrawer } from '@/components/store/CartDrawer';
import { Footer } from '@/components/store/Footer';
import { FloatingWhatsApp } from '@/components/store/FloatingWhatsApp';
import { RecentlyViewedSection } from '@/components/store/RecentlyViewedSection';
import { BackToTop } from '@/components/store/BackToTop';
import { LoadingBar } from '@/components/store/LoadingBar';
import { StickyCartBar } from '@/components/store/StickyCartBar';

import { SocialProofPopup } from '@/components/store/SocialProofPopup';
import { LiveChatIndicator } from '@/components/store/LiveChatIndicator';
import { SaleCountdownBanner } from '@/components/store/SaleCountdownBanner';
import { AdvancedFilters } from '@/components/store/AdvancedFilters';
import { FeaturedCarousel } from '@/components/store/FeaturedCarousel';
import { ProductComparisonButton, ProductComparisonModal } from '@/components/store/ProductComparison';
import { StoreJsonLd } from '@/components/store/ProductJsonLd';
import { Breadcrumbs } from '@/components/store/Breadcrumbs';
import { WishlistShareButton } from '@/components/store/WishlistShareButton';
import { AnnouncementBar } from '@/components/store/AnnouncementBar';
import { StoreStats } from '@/components/store/StoreStats';
import { TestimonialsSection } from '@/components/store/TestimonialsSection';
import { PromoBanner } from '@/components/store/PromoBanner';
import { DeliveryInfo } from '@/components/store/DeliveryInfo';
import { ScrollProgress } from '@/components/store/ScrollProgress';
import { ProductGridToggle } from '@/components/store/ProductGridToggle';
import { KeyboardShortcuts } from '@/components/store/KeyboardShortcuts';
import { WelcomeToast } from '@/components/store/WelcomeToast';
import { NewArrivalsShowcase } from '@/components/store/NewArrivalsShowcase';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types/database';
import { Package } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { ProductGridSkeleton } from '@/components/store/ProductCardSkeleton';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DepartmentKey, departments, visibleCategories } from '@/lib/departments';

export default function Index({ department }: { department?: DepartmentKey }) {
  const [allProducts, setProducts] = useState<Product[]>([]);
  const [allCategories, setCategories] = useState<Category[]>([]);
  const categories = useMemo(() => visibleCategories(allCategories, department), [allCategories, department]);
  const products = useMemo(() => allProducts.filter(product => categories.some(category => category.id === product.category_id)), [allProducts, categories]);
  const page = departments.find(item => item.key === department);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [gridView, setGridView] = useState<'grid' | 'list'>('grid');
  
  // Advanced filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState('default');
  
  const { t, language } = useLanguage();
  const { addItem: addToRecentlyViewed } = useRecentlyViewed();

  // Calculate price bounds
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 500 };
    const prices = products.map(p => p.is_on_sale && p.sale_price ? p.sale_price : p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

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
    const channel = supabase.channel(`store-${department || 'home'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
      .subscribe();
    const refresh = () => { if (document.visibilityState === 'visible') fetchData(); };
    document.addEventListener('visibilitychange', refresh);
    return () => { void supabase.removeChannel(channel); document.removeEventListener('visibilitychange', refresh); };
  }, [department]);

  useEffect(() => {
    setSelectedCategory(null);
    setShowSaleOnly(false);
    setVisibleCount(12);
    window.scrollTo(0, 0);
  }, [department]);

  // Calculate stock per category
  const categoryStockMap = categories.reduce((acc, cat) => {
    const totalStock = products
      .filter(p => p.category_id === cat.id)
      .reduce((sum, p) => sum + p.stock, 0);
    acc[cat.id] = totalStock;
    return acc;
  }, {} as Record<string, number>);

  // Initialize price range when products load
  useEffect(() => {
    if (products.length > 0) {
      setPriceRange([priceBounds.min, priceBounds.max]);
    }
  }, [priceBounds]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      if (showSaleOnly && !p.is_on_sale) return false;
      if (selectedCategory) {
        if (p.category_id !== selectedCategory) return false;
      } else {
        const cat = categories.find(c => c.id === p.category_id);
        if (cat && (!cat.enabled || categoryStockMap[cat.id] === 0)) return false;
      }
      const effectivePrice = p.is_on_sale && p.sale_price ? p.sale_price : p.price;
      if (effectivePrice < priceRange[0] || effectivePrice > priceRange[1]) return false;
      return true;
    });

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => {
          const priceA = a.is_on_sale && a.sale_price ? a.sale_price : a.price;
          const priceB = b.is_on_sale && b.sale_price ? b.sale_price : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        result.sort((a, b) => {
          const priceA = a.is_on_sale && a.sale_price ? a.sale_price : a.price;
          const priceB = b.is_on_sale && b.sale_price ? b.sale_price : b.price;
          return priceB - priceA;
        });
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [products, categories, selectedCategory, showSaleOnly, priceRange, sortBy, categoryStockMap]);

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

  const toggleCompareProduct = (product: Product) => {
    setCompareProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
  };

  const resetFilters = () => {
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSortBy('default');
    setSelectedCategory(null);
    setShowSaleOnly(false);
  };

  const saleCount = products.filter(p => p.is_on_sale).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
      <StoreJsonLd />
      <ScrollProgress />
      <KeyboardShortcuts />
      <WelcomeToast />
      <LoadingBar isLoading={isLoading} />
      <AnnouncementBar />
      <SaleCountdownBanner />
      <Header products={products} onProductClick={handleProductClick} />
      <div className="container pt-7 pb-2">
        <p className="text-xs font-medium text-primary mb-2">Barwaaqo Store</p>
        <h1 className="font-display text-3xl font-bold text-foreground">{page ? (language === 'so' ? page.nameSo : page.name) : (language === 'so' ? 'Dhammaan Ururinta' : 'All Collections')}</h1>
      </div>
      <HeroSection products={products} categories={categories} onCategorySelect={handleHeroCategorySelect} />
      <TrustSignals />
      
      {/* New Arrivals Showcase */}
      <NewArrivalsShowcase products={products} department={department} onProductClick={handleProductClick} />
      
      <CategoryQuickLinks 
        categories={categories}
        onSelectCategory={handleCategorySelect}
        categoryStockMap={categoryStockMap}
      />

      <FeaturedCarousel products={products} onProductClick={handleProductClick} />

      {/* Promo Banner */}
      <PromoBanner onShopSale={handleSaleSelect} />

      <main id="products-section" className="container py-12 flex-1">
        <Breadcrumbs items={[
          { label: selectedCategory 
            ? (categories.find(c => c.id === selectedCategory)?.name || 'Products')
            : (showSaleOnly ? 'Sale' : 'All Products')
          }
        ]} />
        
        <div className="flex justify-end mb-2">
          <WishlistShareButton />
        </div>
        <div className="mb-6">
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

        <AdvancedFilters
          minPrice={priceBounds.min}
          maxPrice={priceBounds.max}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onReset={resetFilters}
        />

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
              {products.length === 0 ? (language === 'so' ? 'Alaab lama heli karo' : 'No products available yet') : t('allProducts')}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {products.length === 0 ? (language === 'so' ? 'Dhawaan dib u soo eeg.' : 'Check back for new arrivals.') : 'Try adjusting your filters or browse all categories'}
            </p>
            {products.length > 0 && <Button variant="outline" onClick={resetFilters} className="rounded-full">
              Reset Filters
            </Button>}
          </motion.div>
        ) : (
          <>
            <ProductGridToggle 
              view={gridView} 
              onViewChange={setGridView} 
              count={filteredProducts.length} 
            />

            {gridView === 'grid' ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {filteredProducts.slice(0, visibleCount).map((product, index) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard 
                      product={product} 
                      index={index} 
                      onClick={() => handleProductClick(product)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3"
              >
                {filteredProducts.slice(0, visibleCount).map((product) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductListCard 
                      product={product}
                      onClick={() => handleProductClick(product)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {visibleCount < filteredProducts.length && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="rounded-full px-8"
                >
                  {t('allProducts')} ({filteredProducts.length - visibleCount} more)
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Store Stats */}
      <StoreStats />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Delivery Info */}
      <DeliveryInfo />

      <RecentlyViewedSection products={products} onProductClick={handleProductClick} />
      
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
      <ProductComparisonButton 
        selectedCount={compareProducts.length} 
        onClick={() => setShowComparison(true)} 
      />
      <ProductComparisonModal 
        isOpen={showComparison} 
        onClose={() => setShowComparison(false)} 
        products={compareProducts} 
      />
    </div>
  );
}
