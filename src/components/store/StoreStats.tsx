import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { ShoppingBag, Users, Star, MapPin } from 'lucide-react';

function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const stats = [
  { icon: ShoppingBag, value: 5000, labelEn: 'Products Sold', labelSo: 'Alaab La Iibiyey', suffix: '+' },
  { icon: Users, value: 2500, labelEn: 'Happy Customers', labelSo: 'Macaamiil Faraxsan', suffix: '+' },
  { icon: Star, value: 4.9, labelEn: 'Average Rating', labelSo: 'Qiimeyn Celcelis', suffix: '/5', isDecimal: true },
  { icon: MapPin, value: 15, labelEn: 'Cities Covered', labelSo: 'Magaalooyin La Gaaro', suffix: '+' },
];

export function StoreStats() {
  const { language } = useLanguage();

  return (
    <section className="py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl py-10 px-6"
          style={{
            background: 'linear-gradient(135deg, hsl(230 40% 20%) 0%, hsl(260 35% 25%) 50%, hsl(230 40% 18%) 100%)'
          }}
        >
          <div className="absolute inset-0 pattern-dots opacity-10" />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/20 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent/15 blur-[80px]" />

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-display">
                  {stat.isDecimal ? stat.value : <AnimatedCounter target={stat.value} />}
                  <span className="text-primary">{stat.suffix}</span>
                </div>
                <p className="text-sm text-white/60">
                  {language === 'so' ? stat.labelSo : stat.labelEn}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
