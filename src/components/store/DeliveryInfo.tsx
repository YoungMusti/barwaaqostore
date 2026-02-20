import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { Truck, Clock, MapPin, Shield } from 'lucide-react';

const deliveryFeatures = [
  {
    icon: Truck,
    titleEn: 'Same Day Delivery',
    titleSo: 'Gaadiid Maalinta',
    descEn: 'Free delivery within Mogadishu for orders over $30',
    descSo: 'Gaadiid bilaash ah Muqdisho dhexdeeda dalabyo ka badan $30',
  },
  {
    icon: Clock,
    titleEn: '2-5 Day Shipping',
    titleSo: '2-5 Maalmood',
    descEn: 'Nationwide delivery across Somalia',
    descSo: 'Gaadiid dalka oo dhan',
  },
  {
    icon: MapPin,
    titleEn: 'Track Your Order',
    titleSo: 'Raadi Dalabkaaga',
    descEn: 'Real-time updates via WhatsApp',
    descSo: 'Warbixino WhatsApp ah',
  },
  {
    icon: Shield,
    titleEn: 'Secure Packaging',
    titleSo: 'Qaabayn Amaan',
    descEn: 'Every order carefully packed and protected',
    descSo: 'Dalab kastaa si taxadar leh ayaa loo duubaa',
  },
];

export function DeliveryInfo() {
  const { language } = useLanguage();

  return (
    <section className="py-10">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl font-bold text-center mb-8"
        >
          {language === 'so' ? 'Macluumaadka Gaadiidka' : 'Delivery Information'}
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {deliveryFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">
                {language === 'so' ? feature.titleSo : feature.titleEn}
              </h3>
              <p className="text-xs text-muted-foreground">
                {language === 'so' ? feature.descSo : feature.descEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
