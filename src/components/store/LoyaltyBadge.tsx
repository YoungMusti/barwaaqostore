import { motion } from 'framer-motion';
import { Award, Star, Crown, Zap } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface LoyaltyBadgeProps {
  orderCount: number;
  className?: string;
}

const tiers = [
  { min: 0, max: 2, name: 'Bronze', nameS: 'Bronze', icon: Award, color: 'text-orange-600 bg-orange-100' },
  { min: 3, max: 5, name: 'Silver', nameSo: 'Lacag', icon: Star, color: 'text-gray-600 bg-gray-100' },
  { min: 6, max: 10, name: 'Gold', nameSo: 'Dahab', icon: Crown, color: 'text-yellow-600 bg-yellow-100' },
  { min: 11, max: Infinity, name: 'Platinum', nameSo: 'Balaatinam', icon: Zap, color: 'text-purple-600 bg-purple-100' },
];

export function LoyaltyBadge({ orderCount, className }: LoyaltyBadgeProps) {
  const { language } = useLanguage();
  
  const currentTier = tiers.find(t => orderCount >= t.min && orderCount <= t.max) || tiers[0];
  const Icon = currentTier.icon;
  const progress = currentTier.max === Infinity 
    ? 100 
    : ((orderCount - currentTier.min) / (currentTier.max - currentTier.min + 1)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", currentTier.color, className)}
    >
      <Icon className="w-4 h-4" />
      <span>{currentTier.name}</span>
      {currentTier.max !== Infinity && (
        <span className="text-xs opacity-70">
          ({orderCount}/{currentTier.max + 1})
        </span>
      )}
    </motion.div>
  );
}

// Display customer tier info
export function LoyaltyTierInfo() {
  const { language } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Crown className="w-4 h-4 text-primary" />
        {language === 'so' ? 'Barnaamijka Daacadnimada' : 'Loyalty Program'}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
        {tiers.map((tier, i) => {
          const Icon = tier.icon;
          return (
            <div key={i} className="bg-card rounded-lg p-2">
              <Icon className={cn("w-5 h-5 mx-auto mb-1", tier.color.split(' ')[0])} />
              <p className="text-xs font-medium">{tier.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {tier.min}+ {language === 'so' ? 'dalabyo' : 'orders'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
