import { ShoppingBag, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { Link } from 'react-router-dom';

export function Header() {
  const { totalItems, setIsOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-foreground tracking-tight">
            {t('shopName')}
          </span>
          <span className="hidden sm:inline text-xs text-muted-foreground font-body uppercase tracking-widest">
            {t('tagline')}
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'so' : 'en')}
            className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full border border-border hover:border-primary/30"
          >
            {language === 'en' ? '🇸🇴 SO' : '🇬🇧 EN'}
          </button>

          {/* Admin link */}
          <Link to="/admin">
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
    </header>
  );
}
