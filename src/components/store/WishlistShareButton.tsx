import { Share2 } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function WishlistShareButton() {
  const { items } = useWishlist();
  const { language } = useLanguage();

  const shareViaWhatsApp = () => {
    if (items.length === 0) {
      toast.error(language === 'so' ? 'Liiskaagu waa madhan yahay' : 'Your wishlist is empty');
      return;
    }

    const productList = items
      .map((p, i) => `${i + 1}. ${p.name} - $${p.is_on_sale && p.sale_price ? p.sale_price.toFixed(2) : p.price.toFixed(2)}`)
      .join('\n');

    const message = encodeURIComponent(
      `${language === 'so' ? '🛍️ Liiskayga Jeclaadka - Barwaaqo Store' : '🛍️ My Wishlist - Barwaaqo Store'}\n\n${productList}\n\n${language === 'so' ? 'Ka eeg: ' : 'Check it out: '}${window.location.origin}`
    );

    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const copyLink = async () => {
    if (items.length === 0) {
      toast.error(language === 'so' ? 'Liiskaagu waa madhan yahay' : 'Your wishlist is empty');
      return;
    }

    const productList = items
      .map((p, i) => `${i + 1}. ${p.name} - $${p.is_on_sale && p.sale_price ? p.sale_price.toFixed(2) : p.price.toFixed(2)}`)
      .join('\n');

    const text = `🛍️ My Wishlist - Barwaaqo Store\n\n${productList}`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast.success(language === 'so' ? 'La koobiyeeyey!' : 'Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="flex gap-2">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={shareViaWhatsApp}
          className="gap-2 text-xs"
        >
          <Share2 className="w-3 h-3" />
          WhatsApp
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyLink}
          className="text-xs"
        >
          {language === 'so' ? 'Koobiyo' : 'Copy'}
        </Button>
      </motion.div>
    </div>
  );
}
