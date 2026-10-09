import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Footprints, Sparkles, Gem } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { storePages } from '@/lib/departments';
import { cn } from '@/lib/utils';

const icons = { home: Home, men: Footprints, women: Gem, cosmetics: Sparkles } as const;

export function DepartmentNav() {
  const { language } = useLanguage();
  return (
    <nav aria-label="Shop departments" className="border-t border-border/50">
      <div className="container flex items-center justify-center gap-1 py-2">
        {storePages.map(department => {
          const Icon = icons[department.key];
          return (
            <NavLink key={department.key} to={department.path} end className="relative min-w-0 flex-1 sm:flex-none">
              {({ isActive }) => (
                <span className={cn(
                  'relative flex items-center justify-center gap-1.5 rounded-full px-2 sm:px-5 py-2 text-xs sm:text-sm font-medium transition-colors',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}>
                  {isActive && (
                    <motion.span layoutId="dept-pill" className="absolute inset-0 rounded-full bg-primary shadow-md" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                  <Icon className="relative h-4 w-4 hidden sm:block" />
                  <span className="relative truncate">{language === 'so' ? department.nameSo : department.name}</span>
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
