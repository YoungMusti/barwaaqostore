import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { Bell, BellRing, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StockAlertButtonProps {
  productId: string;
  productName: string;
}

export function StockAlertButton({ productId, productName }: StockAlertButtonProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('+252');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async () => {
    if (!phone || phone.length < 12) {
      toast.error(language === 'so' 
        ? 'Fadlan gali lambarka telefoonka' 
        : 'Please enter a valid phone number'
      );
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - in production, this would save to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubscribed(true);
    setIsOpen(false);
    
    toast.success(
      language === 'so' 
        ? `Waxaan kuu soo diri doonaa fariin marka ${productName} dib loo helo!` 
        : `We'll notify you when ${productName} is back in stock!`
    );
  };

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 text-sm text-success">
        <BellRing className="w-4 h-4" />
        {language === 'so' ? 'La xiriir dhigay!' : 'Alert set!'}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Bell className="w-4 h-4" />
        {language === 'so' ? 'Ii ogeysii' : 'Notify Me'}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 p-4 bg-card rounded-xl border shadow-lg z-10 min-w-[280px]"
          >
            <h4 className="font-semibold mb-2">
              {language === 'so' ? 'Hel ogeysiis' : 'Get notified'}
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              {language === 'so' 
                ? 'Waxaan kuu soo diri doonnaa fariin marka la helo.' 
                : "We'll send you a message when it's available."
              }
            </p>
            
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="+252 61 xxx xxxx"
                value={phone}
                onChange={(e) => {
                  let value = e.target.value;
                  if (!value.startsWith('+252')) {
                    value = '+252' + value.replace(/^\+?252?/, '');
                  }
                  setPhone(value.slice(0, 13));
                }}
                className="flex-1"
              />
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                size="icon"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
