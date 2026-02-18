import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';

interface SaleBannerData {
  title: string;
  title_somali: string;
  discount_text: string;
  discount_text_somali: string;
  is_active: boolean;
  end_time: string;
}

export function SaleCountdownBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [banner, setBanner] = useState<SaleBannerData | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { language } = useLanguage();

  useEffect(() => {
    async function fetchBanner() {
      const { data } = await supabase
        .from('sale_banners')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();
      if (data) setBanner(data as SaleBannerData);
    }
    fetchBanner();
  }, []);

  useEffect(() => {
    if (!banner) return;

    const calculateTimeLeft = () => {
      const endTime = new Date(banner.end_time).getTime();
      const diff = endTime - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [banner]);

  if (!isVisible || !banner) return null;

  const title = language === 'so' ? banner.title_somali : banner.title;
  const discountText = language === 'so' ? banner.discount_text_somali : banner.discount_text;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(350 80% 55%) 0%, hsl(15 85% 55%) 50%, hsl(35 90% 55%) 100%)'
      }}
    >
      <div className="container py-2 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 animate-pulse" />
          <span className="font-medium">{title}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 font-mono">
          <span className="bg-white/20 px-2 py-0.5 rounded">
            {timeLeft.hours.toString().padStart(2, '0')}
          </span>
          :
          <span className="bg-white/20 px-2 py-0.5 rounded">
            {timeLeft.minutes.toString().padStart(2, '0')}
          </span>
          :
          <span className="bg-white/20 px-2 py-0.5 rounded">
            {timeLeft.seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <span className="hidden md:inline text-white/80">{discountText}</span>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
