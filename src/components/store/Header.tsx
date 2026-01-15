import { ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { Product } from '@/types/database';

interface HeaderProps {
  onProductClick?: (product: Product) => void;
}

export function Header({ onProductClick }: HeaderProps) {
  const { totalItems, setIsOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <span className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight">
            Barwaaqo Store
          </span>
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
          <button
            onClick={() => setLanguage(language === 'en' ? 'so' : 'en')}
            className="px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full border border-border hover:border-primary/30"
          >
            {language === 'en' ? '🇸🇴 SO' : '🇬🇧 EN'}
          </button>

          {/* Wishlist button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            asChild
          >
            <Link to="/?wishlist=true">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
          </Button>

          {/* Admin link - Hidden on mobile */}
          <Link to="/admin" className="hidden md:block">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              {t('admin')}
            </Button>
          </Link>

          {/* Cart button */}
          <Button
            variant="outline"
            size="icon"
            className="relative"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar onProductClick={(product) => onProductClick?.(product)} />
      </div>
    </header>
  );
}
