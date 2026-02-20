import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const testimonials = [
  {
    nameEn: 'Abdi M.', nameSo: 'Cabdi M.',
    textEn: 'Best shoe store in Mogadishu! The quality is amazing and delivery was super fast. I ordered Nike trainers and they arrived the same day.',
    textSo: 'Dukaanka kabaha ugu fiican Muqdisho! Tayada waa cajiib iyo gaadiidku wuu degdeg ahaa.',
    rating: 5, city: 'Mogadishu'
  },
  {
    nameEn: 'Fatima A.', nameSo: 'Faaduma C.',
    textEn: "Love the EVC Plus payment option! So convenient. The shoes are exactly as shown in the pictures. Will definitely order again.",
    textSo: "Waan jeclahay lacag bixinta EVC Plus! Aad bay u fududahay. Kabahana waa sida sawirrada.",
    rating: 5, city: 'Hargeisa'
  },
  {
    nameEn: 'Hassan O.', nameSo: 'Xasan O.',
    textEn: "My kids love their new trainers! Great selection for boys and girls. The prices are very competitive compared to other stores.",
    textSo: "Caruurteyd waxay jecel yihiin kabahoodii cusaa! Xulasho wanaagsan oo wiilasha iyo gabdhaha.",
    rating: 5, city: 'Kismayo'
  },
  {
    nameEn: 'Amina H.', nameSo: 'Aamina X.',
    textEn: "WhatsApp customer service is amazing! They helped me choose the right size and the shoes fit perfectly.",
    textSo: "Adeegga macaamiisha WhatsApp waa cajiib! Waxay i caawiyeen cabbirka saxda ah.",
    rating: 4, city: 'Mogadishu'
  },
];

export function TestimonialsSection() {
  const { language } = useLanguage();

  return (
    <section className="py-12 overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            {language === 'so' ? 'Macaamiisheena Maxay Yiraahdeen' : 'What Our Customers Say'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'so' ? 'Dhageyso macaamiisheena faraxsan' : 'Hear from our happy customers'}
          </p>
        </motion.div>

        <Carousel
          opts={{ align: 'start', loop: true }}
          plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((t, idx) => (
              <CarouselItem key={idx} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full p-6 rounded-2xl border border-border/60 bg-card gradient-card"
                >
                  <Quote className="w-8 h-8 text-primary/30 mb-3" />
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-4 font-body">
                    "{language === 'so' ? t.textSo : t.textEn}"
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < t.rating ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{language === 'so' ? t.nameSo : t.nameEn}</p>
                      <p className="text-xs text-muted-foreground">{t.city}</p>
                    </div>
                    <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                      ✓ {language === 'so' ? 'La Xaqiijiyey' : 'Verified'}
                    </span>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 -translate-x-1/2" />
          <CarouselNext className="right-0 translate-x-1/2" />
        </Carousel>
      </div>
    </section>
  );
}
