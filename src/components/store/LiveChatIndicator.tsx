import { motion } from 'framer-motion';
import { MessageCircle, Headphones } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function LiveChatIndicator() {
  const { language } = useLanguage();

  const handleClick = () => {
    const phone = '+252612502108';
    const message = language === 'so' 
      ? 'Salaamu Calaykum! Waxaan rabaa in aan wax ka weydiiyo.'
      : 'Hello! I have a question about your products.';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-20 right-4 z-40 hidden md:block"
    >
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group flex items-center gap-3 bg-card border border-border rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="relative">
          <Headphones className="w-5 h-5 text-primary" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
        </div>
        <div className="text-left">
          <p className="text-xs text-muted-foreground">
            {language === 'so' ? 'Caawimaad' : 'Support'}
          </p>
          <p className="text-sm font-medium text-foreground">
            {language === 'so' ? 'Online hadda' : 'Online now'}
          </p>
        </div>
      </motion.button>
    </motion.div>
  );
}
