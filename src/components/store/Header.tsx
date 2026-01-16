import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { Product } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onProductClick?: (product: Product) => void;
}

export function Header({ onProductClick }: HeaderProps) {
  const { totalItems, setIsOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl shadow-md border-b border-border/50" 
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0 group">
          <motion.span 
            whileHover={{ scale: 1.02 }}
            className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight"
          >
            Barwaaqo Store
          </motion.span>
        </Link>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:block flex-1 max-w-xs">
          <SearchBar onProductClick={(product) => onProductClick?.(product)} />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* Language toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLanguage(language === 'en' ? 'so' : 'en')}
            className="px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full border border-border hover:border-primary/30"
          >
            {language === 'en' ? '🇸🇴 SO' : '🇬🇧 EN'}
          </motion.button>

          {/* Wishlist button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              asChild
            >
              <Link to="/?wishlist=true">
                <Heart className="h-5 w-5" />
                <AnimatePresence>
                  {wishlistItems.length > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium"
                    >
                      {wishlistItems.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </Button>
          </motion.div>

          {/* Admin link - Hidden on mobile */}
          <Link to="/admin" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
              <User className="h-4 w-4" />
              {t('admin')}
            </Button>
          </Link>

          {/* Cart button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar onProductClick={(product) => onProductClick?.(product)} />
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container py-4 space-y-3">
              <Link 
                to="/admin" 
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>{t('admin')}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
