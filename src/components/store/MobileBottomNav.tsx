import { Home, Search, ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useLanguage } from '@/hooks/useLanguage';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function MobileBottomNav() {
  const { totalItems, setIsOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { language } = useLanguage();
  const location = useLocation();
  const [activeSearch, setActiveSearch] = useState(false);

  // Don't show on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const navItems = [
    { icon: Home, label: language === 'so' ? 'Guriga' : 'Home', path: '/', action: undefined },
    { icon: Search, label: language === 'so' ? 'Raadi' : 'Search', path: undefined, action: () => {
      document.querySelector<HTMLInputElement>('input[placeholder*="Search"], input[placeholder*="Raadi"]')?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }},
    { icon: ShoppingBag, label: language === 'so' ? 'Gaari' : 'Cart', path: undefined, action: () => setIsOpen(true), badge: totalItems },
    { icon: Heart, label: language === 'so' ? 'Jeclaad' : 'Wishlist', path: '/?wishlist=true', action: undefined, badge: wishlistItems.length },
    { icon: FileText, label: language === 'so' ? 'Buug' : 'Catalogue', path: '/catalogue', action: undefined },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
    >
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item, idx) => {
          const isActive = item.path === location.pathname;
          const Icon = item.icon;
          
          return (
            <motion.div
              key={idx}
              whileTap={{ scale: 0.9 }}
              className="relative"
            >
              {item.path ? (
                <Link
                  to={item.path}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    <AnimatePresence>
                      {item.badge && item.badge > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              ) : (
                <button
                  onClick={item.action}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground transition-colors"
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    <AnimatePresence>
                      {item.badge && item.badge > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}
