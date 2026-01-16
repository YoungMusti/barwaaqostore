import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function AnimatedSocialIcon({ href, icon, label, className }: SocialIconProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ scale: 1.2, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background hover:bg-primary hover:text-primary-foreground transition-colors",
        className
      )}
    >
      {icon}
    </motion.a>
  );
}

interface AnimatedSocialIconsProps {
  icons: Array<{
    href: string;
    icon: React.ReactNode;
    label: string;
  }>;
}

export function AnimatedSocialIcons({ icons }: AnimatedSocialIconsProps) {
  return (
    <div className="flex gap-3">
      {icons.map((social, index) => (
        <motion.div
          key={social.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <AnimatedSocialIcon {...social} />
        </motion.div>
      ))}
    </div>
  );
}
