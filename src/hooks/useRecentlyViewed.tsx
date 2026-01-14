import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/database';

interface RecentlyViewedContextType {
  items: Product[];
  addItem: (product: Product) => void;
  clearItems: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const MAX_ITEMS = 8;

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    const stored = localStorage.getItem('barwaaqo-recently-viewed');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('barwaaqo-recently-viewed', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product) => {
    setItems(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== product.id);
      // Add to front and limit to MAX_ITEMS
      return [product, ...filtered].slice(0, MAX_ITEMS);
    });
  };

  const clearItems = () => {
    setItems([]);
  };

  return (
    <RecentlyViewedContext.Provider value={{ items, addItem, clearItems }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
}
