import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { departments } from '@/lib/departments';

export function DepartmentNav() {
  const { language } = useLanguage();
  return (
    <nav aria-label="Shop departments" className="border-t border-border/50">
      <div className="container flex items-center justify-center gap-1 py-2">
        {departments.map(department => (
          <NavLink key={department.key} to={department.path} end className="min-w-0 flex-1 sm:flex-none">
            {({ isActive }) => (
              <Button asChild variant={isActive ? 'secondary' : 'ghost'} className="w-full px-2 sm:px-5 text-xs sm:text-sm rounded-md">
                <span>{language === 'so' ? department.nameSo : department.name}</span>
              </Button>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}