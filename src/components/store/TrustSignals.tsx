import { Check, Truck, Package, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const signals = [
  { icon: Check, labelEn: 'EVC Plus accepted', labelSo: 'EVC Plus waa la aqbalaa' },
  { icon: Truck, labelEn: 'Local Somalia delivery', labelSo: 'Gaadiid gudaha Soomaaliya' },
  { icon: Package, labelEn: 'Verified stock', labelSo: 'Alaab la hubiyey' },
  { icon: MessageCircle, labelEn: 'Fast response on WhatsApp', labelSo: 'Jawaab degdeg ah WhatsApp' },
];

export function TrustSignals() {
  const { language } = useLanguage();

  return (
    <section className="bg-primary/5 border-y border-border py-4">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {signals.map((signal, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 text-sm text-foreground/80"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-success/20">
                <signal.icon className="w-3 h-3 text-success" />
              </span>
              <span className="font-medium">
                {language === 'so' ? signal.labelSo : signal.labelEn}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
