import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowRight, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromoBannerProps {
  onShopSale?: () => void;
}

export function PromoBanner({ onShopSale }: PromoBannerProps) {
  const { language } = useLanguage();

  return (
    <section className="container py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl p-8 md:p-12"
        style={{
          background: 'linear-gradient(135deg, hsl(230 50% 25%) 0%, hsl(260 45% 35%) 50%, hsl(15 85% 55%) 100%)'
        }}
      >
        <div className="absolute inset-0 pattern-dots opacity-5" />
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/30 blur-[60px]" />

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium mb-4">
              <Percent className="w-3.5 h-3.5" />
              {language === 'so' ? 'Qiimo Gaar Ah' : 'Special Offer'}
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
              {language === 'so' ? 'Ilaa 50% Dhimis' : 'Up To 50% Off'}
            </h2>
            <p className="text-white/70 max-w-md">
              {language === 'so'
                ? 'Hel kabaha ugu tayada badan qiimo aad u jaban. Fursadda ha ka tagina!'
                : 'Get premium footwear at unbeatable prices. Don\'t miss this opportunity!'
              }
            </p>
          </div>
          <Button
            onClick={onShopSale}
            size="lg"
            className="rounded-full gap-2 bg-white text-foreground hover:bg-white/90 shadow-xl"
          >
            {language === 'so' ? 'Soo Iibso Hadda' : 'Shop Sale'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
