import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from './ProductCard';
import { useLanguage } from '@/hooks/useLanguage';
import { Sparkles } from 'lucide-react';

interface RelatedProductsProps {
  currentProductId: string;
  categoryId: string | null;
  onProductClick: (product: Product) => void;
}

export function RelatedProducts({ currentProductId, categoryId, onProductClick }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    async function fetchRelated() {
      setIsLoading(true);
      
      let query = supabase
        .from('products')
        .select('*, category:categories(*)')
        .neq('id', currentProductId)
        .gt('stock', 0)
        .limit(4);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data } = await query;
      
      // If not enough in same category, get more from other categories
      if (data && data.length < 4) {
        const { data: moreData } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .neq('id', currentProductId)
          .gt('stock', 0)
          .not('id', 'in', `(${data.map(p => p.id).join(',')})`)
          .limit(4 - data.length);
        
        if (moreData) {
          setProducts([...data, ...moreData] as Product[]);
        } else {
          setProducts(data as Product[]);
        }
      } else {
        setProducts((data || []) as Product[]);
      }
      
      setIsLoading(false);
    }
    
    fetchRelated();
  }, [currentProductId, categoryId]);

  if (isLoading || products.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-display text-lg font-semibold">
          {language === 'so' ? 'Alaab la xiriirta' : 'You May Also Like'}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {products.slice(0, 4).map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard 
              product={product} 
              onClick={() => onProductClick(product)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
