import { Product } from '@/types/database';

interface ProductJsonLdProps {
  product: Product;
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const effectivePrice = product.is_on_sale && product.sale_price ? product.sale_price : product.price;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.image_url || '',
    offers: {
      '@type': 'Offer',
      price: effectivePrice.toFixed(2),
      priceCurrency: 'USD',
      availability: product.stock > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Barwaaqo Store',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function StoreJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Barwaaqo Store',
    description: 'Premium footwear at affordable prices in Somalia',
    url: window.location.origin,
    telephone: '+252612502108',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SO',
    },
    openingHours: 'Mo-Su 07:00-22:00',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
