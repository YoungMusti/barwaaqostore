import { useState } from 'react';
import { Mail, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfettiEffect } from './ConfettiEffect';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate subscription (would connect to actual email service)
    setIsSubmitted(true);
    setShowConfetti(true);
    toast.success(
      language === 'so' 
        ? 'Waad ku guulaysatay! Mahadsanid.' 
        : 'Successfully subscribed! Thank you.'
    );
    setEmail('');
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <>
      <ConfettiEffect isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-background/10 rounded-xl p-4 mt-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-4 h-4" />
          <h4 className="font-semibold text-sm">
            {language === 'so' ? 'Ku Biir Liiskeena' : 'Join Our Newsletter'}
          </h4>
        </div>
        <p className="text-xs text-background/70 mb-3">
          {language === 'so' 
            ? 'Hel warbixino cusub & qiimo dhimis gaar ah.' 
            : 'Get updates on new arrivals & exclusive deals.'
          }
        </p>
        
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 text-success-foreground bg-success/20 p-3 rounded-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <CheckCircle className="w-5 h-5" />
              </motion.div>
              <span className="text-sm font-medium">
                {language === 'so' ? 'Waad ku biirtay!' : 'You\'re subscribed!'}
              </span>
              <Sparkles className="w-4 h-4 ml-auto" />
            </motion.div>
          ) : (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="flex gap-2"
            >
              <Input
                type="email"
                placeholder={language === 'so' ? 'Email-kaaga' : 'Your email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 bg-background/20 border-background/30 text-background placeholder:text-background/50 flex-1"
                required
              />
              <Button 
                type="submit" 
                size="sm" 
                variant="secondary" 
                className="h-9 px-4"
              >
                {language === 'so' ? 'Biir' : 'Join'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
