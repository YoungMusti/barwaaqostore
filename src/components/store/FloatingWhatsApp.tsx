import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export function FloatingWhatsApp() {
  const { language } = useLanguage();
  const phoneNumber = '252612502108';
  const message = encodeURIComponent(
    language === 'so' 
      ? 'Salaan, waxaan rabaa in aan wax ka weydiiyo dukaanka.' 
      : 'Hello, I have a question about the store.'
  );

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      <div className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="hidden sm:inline font-medium text-sm whitespace-nowrap">
          {language === 'so' ? 'Caawimaad u baahan?' : 'Need help? Chat with us'}
        </span>
      </div>
    </a>
  );
}
