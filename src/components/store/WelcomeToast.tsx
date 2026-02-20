import { useEffect } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

export function WelcomeToast() {
  const { language } = useLanguage();

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('barwaaqo_welcomed');
    if (hasVisited) return;

    const timer = setTimeout(() => {
      toast(
        language === 'so'
          ? '👋 Ku soo dhawoow Barwaaqo Store!'
          : '👋 Welcome to Barwaaqo Store!',
        {
          description: language === 'so'
            ? 'Hel kabaha ugu tayada badan qiimo jaban.'
            : 'Discover premium footwear at great prices.',
          duration: 5000,
        }
      );
      sessionStorage.setItem('barwaaqo_welcomed', 'true');
    }, 2000);

    return () => clearTimeout(timer);
  }, [language]);

  return null;
}
