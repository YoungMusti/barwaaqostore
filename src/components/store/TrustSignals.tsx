import { motion } from 'framer-motion';
import { Check, Truck, Package, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { AnimatedTrustBadge } from './AnimatedTrustBadge';

const signals = [
  { 
    icon: Check, 
    labelEn: 'EVC Plus accepted', 
    labelSo: 'EVC Plus waa la aqbalaa',
    tooltipEn: 'Pay securely with your EVC Plus account',
    tooltipSo: 'Ku bixi si ammaan ah akoonkaaga EVC Plus'
  },
  { 
    icon: Truck, 
    labelEn: 'Local Somalia delivery', 
    labelSo: 'Gaadiid gudaha Soomaaliya',
    tooltipEn: 'Fast delivery across Somalia',
    tooltipSo: 'Gaadiid degdeg ah oo Soomaaliya oo dhan'
  },
  { 
    icon: Package, 
    labelEn: 'Verified stock', 
    labelSo: 'Alaab la hubiyey',
    tooltipEn: 'All products verified in stock',
    tooltipSo: 'Alaabta oo dhan waa la hubiyey'
  },
  { 
    icon: MessageCircle, 
    labelEn: 'Fast response on WhatsApp', 
    labelSo: 'Jawaab degdeg ah WhatsApp',
    tooltipEn: 'Quick support via WhatsApp',
    tooltipSo: 'Taageero degdeg ah WhatsApp'
  },
];

export function TrustSignals() {
  const { language } = useLanguage();

  return (
    <section className="py-4">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-primary/5 border border-border rounded-xl py-4 px-4 md:px-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {signals.map((signal, index) => (
              <AnimatedTrustBadge
                key={index}
                icon={signal.icon}
                label={language === 'so' ? signal.labelSo : signal.labelEn}
                tooltip={language === 'so' ? signal.tooltipSo : signal.tooltipEn}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
