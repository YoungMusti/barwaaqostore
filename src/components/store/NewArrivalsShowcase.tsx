import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

import shoeWhiteGrey from '@/assets/shoes/shoe-white-grey.jpg';
import shoeBlackOrange from '@/assets/shoes/shoe-black-orange.jpg';
import shoeBeigeKnit from '@/assets/shoes/shoe-beige-knit.jpg';
import shoeBlackSport from '@/assets/shoes/shoe-black-sport.jpg';
import shoePurpleOrange from '@/assets/shoes/shoe-purple-orange.jpg';
import shoeWhiteBlue from '@/assets/shoes/shoe-white-blue.jpg';
import shoeColorfulKids from '@/assets/shoes/shoe-colorful-kids.jpg';
import shoeWhiteGreen from '@/assets/shoes/shoe-white-green.jpg';
import shoeBlackGold from '@/assets/shoes/shoe-black-gold.jpg';
import shoeWhiteTeal from '@/assets/shoes/shoe-white-teal.jpg';
import shoeGreyKnit from '@/assets/shoes/shoe-grey-knit.jpg';
import shoeWhiteNeon from '@/assets/shoes/shoe-white-neon.jpg';
import shoeOliveAir from '@/assets/shoes/shoe-olive-air.jpg';
import shoeGreyBlade from '@/assets/shoes/shoe-grey-blade.jpg';
import shoeBlackRed from '@/assets/shoes/shoe-black-red.jpg';
import shoeBrownSlip from '@/assets/shoes/shoe-brown-slip.jpg';
import shoeKhakiSlip from '@/assets/shoes/shoe-khaki-slip.jpg';
import shoeBlackYellowSlip from '@/assets/shoes/shoe-black-yellow-slip.jpg';
import shoeBlackRedKnit from '@/assets/shoes/shoe-black-red-knit.jpg';
import shoeDarkStripe from '@/assets/shoes/shoe-dark-stripe.jpg';
import shoeWhiteNavyTan from '@/assets/shoes/shoe-white-navy-tan.jpg';
import shoeSpottedYellow from '@/assets/shoes/shoe-spotted-yellow.jpg';
import shoeRedBlueAir from '@/assets/shoes/shoe-red-blue-air.jpg';
import shoeWhiteWing from '@/assets/shoes/shoe-white-wing.jpg';
import shoeTanGreen from '@/assets/shoes/shoe-tan-green.jpg';
import shoeWhiteStripe from '@/assets/shoes/shoe-white-stripe.jpg';
import shoeGreyCloud from '@/assets/shoes/shoe-grey-cloud.jpg';
import shoeTealRainbow from '@/assets/shoes/shoe-teal-rainbow.jpg';
import shoeOrangeChunky from '@/assets/shoes/shoe-orange-chunky.jpg';
import shoeBlackGer from '@/assets/shoes/shoe-black-ger.jpg';
import shoeWhiteOrangeChunky from '@/assets/shoes/shoe-white-orange-chunky.jpg';
import shoeGreyYellow from '@/assets/shoes/shoe-grey-yellow.jpg';
import shoeNavyWave from '@/assets/shoes/shoe-navy-wave.jpg';
import shoeWhiteBlueGradient from '@/assets/shoes/shoe-white-blue-gradient.jpg';
import shoeBlackBlue700 from '@/assets/shoes/shoe-black-blue-700.jpg';
import shoeGreyFashion from '@/assets/shoes/shoe-grey-fashion.jpg';
import shoeWhiteGreenStripe from '@/assets/shoes/shoe-white-green-stripe.jpg';
import shoePurpleGrey from '@/assets/shoes/shoe-purple-grey.jpg';
import shoeBlackWhiteRetro from '@/assets/shoes/shoe-black-white-retro.jpg';
import shoeWhiteGreen30 from '@/assets/shoes/shoe-white-green-30.jpg';

const showcaseItems = [
  { image: shoeWhiteGrey, name: 'Urban Classic', tag: 'Casual' },
  { image: shoeBlackOrange, name: 'Night Runner', tag: 'Sport' },
  { image: shoeBeigeKnit, name: 'Breeze Knit', tag: 'Comfort' },
  { image: shoeBlackSport, name: 'Shadow Strike', tag: 'Athletic' },
  { image: shoePurpleOrange, name: 'Trail Blaze', tag: 'Outdoor' },
  { image: shoeWhiteBlue, name: 'Ocean Wave', tag: 'Running' },
  { image: shoeColorfulKids, name: 'Color Pop', tag: 'Kids' },
  { image: shoeWhiteGreen, name: 'Fresh Step', tag: 'Kids' },
  { image: shoeBlackGold, name: 'Luxe Runner', tag: 'Premium' },
  { image: shoeWhiteTeal, name: 'Crystal Flow', tag: 'Premium' },
  { image: shoeGreyKnit, name: 'Storm Flex', tag: 'Running' },
  { image: shoeWhiteNeon, name: 'Neon Surge', tag: 'Sport' },
  { image: shoeOliveAir, name: 'Safari Air', tag: 'Casual' },
  { image: shoeGreyBlade, name: 'Blade Runner', tag: 'Athletic' },
  { image: shoeBlackRed, name: 'Inferno', tag: 'Sport' },
  { image: shoeBrownSlip, name: 'Glide', tag: 'Slip-On' },
  { image: shoeKhakiSlip, name: 'Desert Walk', tag: 'Slip-On' },
  { image: shoeBlackYellowSlip, name: 'Stealth', tag: 'Slip-On' },
  { image: shoeBlackRedKnit, name: 'Phantom', tag: 'Premium' },
  { image: shoeDarkStripe, name: 'Power Step', tag: 'Athletic' },
  { image: shoeWhiteNavyTan, name: 'Harbor', tag: 'Casual' },
  { image: shoeSpottedYellow, name: 'Cheetah', tag: 'Sport' },
  { image: shoeRedBlueAir, name: 'Patriot Air', tag: 'Running' },
  { image: shoeWhiteWing, name: 'Angel Wing', tag: 'Premium' },
  { image: shoeTanGreen, name: 'Eco Boost', tag: 'Running' },
  { image: shoeWhiteStripe, name: 'Court Pro', tag: 'Casual' },
  { image: shoeGreyCloud, name: 'Cloud Walk', tag: 'Comfort' },
  { image: shoeTealRainbow, name: 'Prism', tag: 'Kids' },
  { image: shoeOrangeChunky, name: 'Blaze Max', tag: 'Sport' },
  { image: shoeBlackGer, name: 'Titan', tag: 'Athletic' },
];

export function NewArrivalsShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useLanguage();

  const next = () => setActiveIndex((i) => (i + 1) % showcaseItems.length);
  const prev = () => setActiveIndex((i) => (i - 1 + showcaseItems.length) % showcaseItems.length);

  const getVisibleItems = () => {
    const items = [];
    for (let i = -2; i <= 2; i++) {
      const idx = (activeIndex + i + showcaseItems.length) % showcaseItems.length;
      items.push({ ...showcaseItems[idx], offset: i, idx });
    }
    return items;
  };

  return (
    <section className="py-16 overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            New Collection
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Fresh Arrivals
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Explore our latest collection of premium footwear
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative flex items-center justify-center h-[420px] md:h-[480px]">
          {/* Nav buttons */}
          <button
            onClick={prev}
            className="absolute left-2 md:left-8 z-20 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 md:right-8 z-20 w-10 h-10 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Cards */}
          <AnimatePresence mode="popLayout">
            {getVisibleItems().map((item) => {
              const isCenter = item.offset === 0;
              const scale = isCenter ? 1 : 0.75 - Math.abs(item.offset) * 0.08;
              const x = item.offset * (isCenter ? 0 : 220);
              const zIndex = 10 - Math.abs(item.offset);
              const opacity = isCenter ? 1 : 0.6 - Math.abs(item.offset) * 0.15;

              return (
                <motion.div
                  key={`${item.idx}-${item.offset}`}
                  className="absolute cursor-pointer"
                  animate={{
                    x,
                    scale,
                    zIndex,
                    opacity: Math.max(opacity, 0.2),
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  onClick={() => {
                    if (item.offset !== 0) setActiveIndex(item.idx);
                  }}
                  style={{ zIndex }}
                >
                  <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-shadow ${isCenter ? 'ring-2 ring-primary/30' : ''}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-56 h-72 md:w-72 md:h-96 object-cover"
                      draggable={false}
                    />
                    {/* Overlay info */}
                    {isCenter && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5"
                      >
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium mb-2">
                          {item.tag}
                        </span>
                        <h3 className="text-white font-display text-xl font-bold">
                          {item.name}
                        </h3>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {showcaseItems.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === activeIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
