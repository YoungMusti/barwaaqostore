import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { Truck, Shield, RefreshCw, Sparkles } from 'lucide-react';

const announcements = [
  { icon: Truck, en: '🚚 Free delivery in Mogadishu', so: '🚚 Gaadiid bilaash ah Muqdisho' },
  { icon: Shield, en: '✅ 100% Authentic Products', so: '✅ Alaab 100% Asal ah' },
  { icon: RefreshCw, en: '🔄 Easy Returns Within 7 Days', so: '🔄 Soo Celin Fudud 7 Maalmood' },
  { icon: Sparkles, en: '⭐ New Arrivals Weekly', so: '⭐ Alaab Cusub Toddobaadkiiba' },
];

export function AnnouncementBar() {
  const { language } = useLanguage();

  return (
    <div className="bg-foreground text-background overflow-hidden py-2">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        {[...announcements, ...announcements].map((item, idx) => (
          <span key={idx} className="inline-flex items-center gap-2 mx-8 text-xs font-medium tracking-wide uppercase">
            <item.icon className="w-3.5 h-3.5" />
            {language === 'so' ? item.so : item.en}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
