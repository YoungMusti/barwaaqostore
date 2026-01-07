import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'so';

interface Translations {
  [key: string]: {
    en: string;
    so: string;
  };
}

const translations: Translations = {
  // Header
  shopName: { en: 'SOLE', so: 'SOLE' },
  tagline: { en: 'Premium Footwear', so: 'Kabo Tayada Sare' },
  cart: { en: 'Cart', so: 'Gaariga' },
  admin: { en: 'Admin', so: 'Maamul' },
  
  // Categories
  allProducts: { en: 'All Products', so: 'Dhammaan Alaabta' },
  men: { en: 'Men', so: 'Rag' },
  women: { en: 'Women', so: 'Dumar' },
  boys: { en: 'Boys', so: 'Wiilal' },
  girls: { en: 'Girls', so: 'Gabarro' },
  
  // Product
  inStock: { en: 'In Stock', so: 'Waa La Helaa' },
  outOfStock: { en: 'Out of Stock', so: 'Lama Heli Karo' },
  unitsLeft: { en: 'units left', so: 'qaybo hadhy' },
  addToCart: { en: 'Add to Cart', so: 'Ku dar Gaariga' },
  
  // Cart
  yourCart: { en: 'Your Cart', so: 'Gaarigaaga' },
  emptyCart: { en: 'Your cart is empty', so: 'Gaarigaagu wuu madhan yahay' },
  continueShopping: { en: 'Continue Shopping', so: 'Sii Wad Wax Iibsashada' },
  total: { en: 'Total', so: 'Wadarta' },
  checkout: { en: 'Checkout', so: 'Bixinta' },
  
  // Payment
  payWithEVC: { en: 'Pay with EVC Plus', so: 'Ku bixi EVC Plus' },
  paymentInstructions: { en: 'Dial the following code to pay:', so: 'Garaac nambarka hoose si aad u bixiso:' },
  enterPhone: { en: 'Enter your mobile number', so: 'Geli nambarka telefankaaga' },
  enterReference: { en: 'Enter EVC transaction reference', so: 'Geli tixraaca EVC' },
  confirmPayment: { en: 'Confirm Payment', so: 'Xaqiiji Bixinta' },
  
  // Confirmation
  thankYou: { en: 'Thank you!', so: 'Mahadsanid!' },
  orderConfirmed: { 
    en: 'Your payment is being verified. We will contact you shortly.', 
    so: 'Bixintaada waa la hubinayaa. Waan kula soo xiriiri doonnaa goor dhow.' 
  },
  backToShop: { en: 'Back to Shop', so: 'Ku Noqo Dukaanka' },
  
  // Status
  pending: { en: 'Pending', so: 'La sugayo' },
  paid: { en: 'Paid', so: 'La bixiyey' },
  processing: { en: 'Processing', so: 'Waa la habeynayaa' },
  completed: { en: 'Completed', so: 'La dhameeyey' },
  cancelled: { en: 'Cancelled', so: 'La joojiyey' },
  
  // Admin
  dashboard: { en: 'Dashboard', so: 'Guddiga' },
  products: { en: 'Products', so: 'Alaabaha' },
  orders: { en: 'Orders', so: 'Dalabka' },
  categories: { en: 'Categories', so: 'Qaybaha' },
  logout: { en: 'Logout', so: 'Ka bax' },
  login: { en: 'Login', so: 'Gal' },
  
  // Forms
  save: { en: 'Save', so: 'Kaydi' },
  cancel: { en: 'Cancel', so: 'Jooji' },
  delete: { en: 'Delete', so: 'Tirtir' },
  edit: { en: 'Edit', so: 'Wax ka badal' },
  add: { en: 'Add', so: 'Kudar' },
  search: { en: 'Search', so: 'Raadi' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
