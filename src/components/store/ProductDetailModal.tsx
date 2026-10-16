import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Product, ProductImage, ProductColor, ProductSize } from '@/types/database';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from './CurrencyToggle';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, ChevronLeft, ChevronRight, Package, Loader2, Heart, Ruler, Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { whatsappOrderLink } from '@/lib/insights';
import { cn } from '@/lib/utils';
import { SizeGuideModal } from './SizeGuideModal';
import { ProductReviews } from './ProductReviews';
import { toast } from 'sonner';

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { t, language } = useLanguage();
  const { formatPrice, currency, rate } = useCurrency();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [bundle, setBundle] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (product && open) {
      setIsLoading(true);
      setSelectedImage(0);
      setSelectedColor(null);
      setSelectedSize(null);
      
      Promise.all([
        supabase.from('product_images').select('*').eq('product_id', product.id).order('display_order'),
        supabase.from('product_colors').select('*').eq('product_id', product.id),
        supabase.from('product_sizes').select('*').eq('product_id', product.id).order('eu_size'),
        supabase.from('products').select('*').gt('stock', 0).neq('id', product.id).limit(40),
      ]).then(([imagesRes, colorsRes, sizesRes, otherRes]) => {
        setImages(imagesRes.data || []);
        setColors(colorsRes.data || []);
        setSizes(sizesRes.data || []);
        const others = (otherRes.data || []) as Product[];
        // Pair with something from a different collection first (e.g. shoes + cosmetics), then same collection
        const diff = others.filter(p => p.category_id !== product.category_id);
        const pool = [...diff.sort(() => Math.random() - 0.5), ...others.filter(p => p.category_id === product.category_id)];
        setBundle(pool.slice(0, 2));
        if (colorsRes.data?.length) setSelectedColor(colorsRes.data[0].name);
        if (sizesRes.data?.length) setSelectedSize(`${sizesRes.data[0].eu_size}/${sizesRes.data[0].us_size}`);
        setIsLoading(false);
      });
    }
  }, [product, open]);

  if (!product) return null;
  const productUrl = `${window.location.origin}/product/${product.id}`;

  const isOnSale = product.is_on_sale && product.sale_price !== null;
  const displayPrice = isOnSale ? product.sale_price! : product.price;
  const inWishlist = isInWishlist(product.id);
  
  // Build gallery - main image + additional images
  const allImages = [
    ...(product.image_url ? [{ id: 'main', image_url: product.image_url, display_order: 0 }] : []),
    ...images.filter(img => img.image_url !== product.image_url)
  ];
  
  const currentImage = allImages[selectedImage]?.image_url;
  
  // Check if a specific size has stock
  const selectedSizeObj = sizes.find(s => `${s.eu_size}/${s.us_size}` === selectedSize);
  const hasStock = sizes.length > 0 ? (selectedSizeObj?.stock || 0) > 0 : product.stock > 0;
  const totalStock = sizes.length > 0 
    ? sizes.reduce((sum, s) => sum + s.stock, 0) 
    : product.stock;

  const handleAddToCart = () => {
    if (!hasStock) return;
    addItem(product, 1, selectedSize, selectedColor);
    onOpenChange(false);
  };

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image Gallery */}
              <div className="relative bg-secondary/30">
                <div className="aspect-square relative overflow-hidden">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-20 h-20 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  {/* Sale badge */}
                  {isOnSale && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-destructive text-destructive-foreground">
                        {t('sale')}
                      </span>
                    </div>
                  )}
                  
                  {/* Wishlist button */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={cn(
                      "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      inWishlist 
                        ? "bg-destructive text-destructive-foreground" 
                        : "bg-background/80 hover:bg-background text-foreground"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", inWishlist && "fill-current")} />
                  </button>
                  
                  {/* Navigation arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Thumbnail strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={cn(
                          "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all",
                          selectedImage === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="p-6 flex flex-col">
                <h2 className="font-display text-2xl font-bold mb-2">{product.name}</h2>
                
                {product.description && (
                  <p className="text-muted-foreground mb-4">{product.description}</p>
                )}
                
                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-bold">{formatPrice(displayPrice)}</span>
                  {isOnSale && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-destructive text-destructive-foreground">
                        -{Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
                      </span>
                    </>
                  )}
                </div>
                <p className="-mt-3 mb-4 text-sm text-muted-foreground">
                  {currency === 'USD' ? `≈ Sh${Math.round(displayPrice * rate).toLocaleString('en')} SOS` : `≈ $${displayPrice.toFixed(2)} USD`}
                </p>
                
                {/* Colors */}
                {colors.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-medium mb-2">Color: <span className="text-muted-foreground">{selectedColor}</span></h4>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(color => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(color.name)}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all",
                            selectedColor === color.name ? "border-primary ring-2 ring-primary/20" : "border-border"
                          )}
                          style={{ backgroundColor: color.hex_code }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Sizes */}
                {sizes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Size (EU/US)</h4>
                      <button 
                        onClick={() => setShowSizeGuide(true)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Ruler className="w-3 h-3" />
                        {language === 'so' ? 'Hagaha Cabbirka' : 'Size Guide'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map(size => {
                        const sizeKey = `${size.eu_size}/${size.us_size}`;
                        const isOutOfStock = size.stock === 0;
                        return (
                          <button
                            key={size.id}
                            onClick={() => !isOutOfStock && setSelectedSize(sizeKey)}
                            disabled={isOutOfStock}
                            className={cn(
                              "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                              selectedSize === sizeKey
                                ? "border-primary bg-primary text-primary-foreground"
                                : isOutOfStock
                                  ? "border-border bg-muted text-muted-foreground/50 cursor-not-allowed line-through"
                                  : "border-border hover:border-primary"
                            )}
                          >
                            EU {size.eu_size} / US {size.us_size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Stock indicator */}
                <div className="mb-6">
                  {totalStock === 0 ? (
                    <span className="text-destructive font-medium">{t('outOfStock')}</span>
                  ) : totalStock <= 5 ? (
                    <span className="text-warning font-medium">{totalStock} {t('unitsLeft')}</span>
                  ) : (
                    <span className="text-success font-medium">{t('inStock')}</span>
                  )}
                </div>
                
                {/* Add to cart */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!hasStock}
                    className="flex-1 h-12 text-base rounded-xl gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {hasStock ? t('addToCart') : t('outOfStock')}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    onClick={() => toggleWishlist(product)}
                  >
                    <Heart className={cn("w-5 h-5", inWishlist && "fill-current text-destructive")} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    title="Copy link"
                    onClick={() => {
                      navigator.clipboard.writeText(productUrl);
                      setCopied(true);
                      toast.success(language === 'so' ? 'La koobiyey!' : 'Link copied!');
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button asChild variant="secondary" className="h-11 rounded-xl gap-2">
                    <a href={whatsappOrderLink(product.name, formatPrice(displayPrice), productUrl, selectedSize)} target="_blank" rel="noreferrer">
                      <MessageCircle className="w-4 h-4" />{language === 'so' ? 'Ku dalbo WhatsApp' : 'Order on WhatsApp'}
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="h-11 rounded-xl gap-2">
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${product.name} — ${formatPrice(displayPrice)}\n${productUrl}`)}`} target="_blank" rel="noreferrer">
                      <Share2 className="w-4 h-4" />{language === 'so' ? 'La wadaag' : 'Share'}
                    </a>
                  </Button>
                </div>

                {bundle.length > 0 && (
                  <div className="mt-6 rounded-2xl border p-4">
                    <h4 className="font-semibold mb-3">{language === 'so' ? 'Dhammaystir muuqaalka' : 'Complete the look'}</h4>
                    <div className="flex gap-2 mb-3">
                      {[product, ...bundle].map(p => (
                        <div key={p.id} className="flex-1 text-center">
                          <img src={p.image_url || ''} alt={p.name} className="w-full aspect-square object-cover rounded-lg bg-secondary" />
                          <div className="text-xs mt-1 truncate">{p.name}</div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => {
                      [product, ...bundle].forEach(p => addItem(p, 1, p.id === product.id ? selectedSize : null, p.id === product.id ? selectedColor : null));
                      toast.success(language === 'so' ? 'Dhammaan waa lagu daray' : 'All added to cart');
                    }}>
                      {language === 'so' ? 'Ku dar dhammaan' : 'Add all'} — {formatPrice([product, ...bundle].reduce((s, p) => s + (p.is_on_sale && p.sale_price ? p.sale_price : p.price), 0))}
                    </Button>
                  </div>
                )}
                
                {/* Reviews Section */}
                <ProductReviews productId={product.id} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Size Guide Modal */}
      <SizeGuideModal open={showSizeGuide} onOpenChange={setShowSizeGuide} />
    </>
  );
}
