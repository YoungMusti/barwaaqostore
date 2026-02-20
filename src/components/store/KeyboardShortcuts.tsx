import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';

export function KeyboardShortcuts() {
  const { setIsOpen } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"], input[placeholder*="Raadi"]');
        if (input) {
          input.focus();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      // Cmd/Ctrl + B for cart
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  return null;
}
