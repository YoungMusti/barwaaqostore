import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '@/types/database';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedSize?: string | null, selectedColor?: string | null) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'barwaago_cart';

// Get the effective price (sale price if on sale, otherwise regular price)
function getEffectivePrice(product: Product): number {
  return product.is_on_sale && product.sale_price ? product.sale_price : product.price;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on init
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity = 1, selectedSize?: string | null, selectedColor?: string | null) => {
    if (product.stock < 1) {
      toast.error('Product is out of stock');
      return;
    }

    setItems(prev => {
      // For products with variants, check if exact variant exists
      const existing = prev.find(item => 
        item.product.id === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
      );
      
      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, product.stock);
        if (newQuantity === existing.quantity) {
          toast.error('Cannot add more - stock limit reached');
          return prev;
        }
        toast.success(`Updated quantity in cart`);
        return prev.map(item =>
          item.product.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
            ? { ...item, quantity: newQuantity, product }
            : item
        );
      }
      toast.success('Added to cart');
      return [...prev, { product, quantity: Math.min(quantity, product.stock), selectedSize, selectedColor }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.min(quantity, item.product.stock);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  // Use effective price (sale price if on sale)
  const totalAmount = items.reduce((sum, item) => sum + getEffectivePrice(item.product) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Export helper for use in other components
export { getEffectivePrice };
