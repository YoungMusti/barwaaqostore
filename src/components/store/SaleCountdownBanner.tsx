import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function SaleCountdownBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const { language } = useLanguage();

  // End of day countdown
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      return {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-gradient-to-r from-destructive to-primary text-white relative overflow-hidden"
    >
      <div className="container py-2 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 animate-pulse" />
          <span className="font-medium">
            {language === 'so' ? 'Qiimo Gaar ah!' : 'Flash Sale!'}
          </span>
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
        <span className="hidden md:inline text-white/80">
          {language === 'so' ? 'ilaa 50% dhimis!' : 'Up to 50% off!'}
        </span>
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
