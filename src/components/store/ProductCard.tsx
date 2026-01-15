import { Product } from '@/types/database';
import { useLanguage } from '@/hooks/useLanguage';
import { useWishlist } from '@/hooks/useWishlist';
import { Package, Heart, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StarRating } from './ProductReviews';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

interface ProductCardProps {
  product: Product;
  index?: number;
  onClick?: () => void;
}

export function ProductCard({ product, index = 0, onClick }: ProductCardProps) {
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOnSale = product.is_on_sale && product.sale_price !== null;
  const displayPrice = isOnSale ? product.sale_price! : product.price;
  const inWishlist = isInWishlist(product.id);

  // Mock rating (would come from database in production)
  const mockRating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation (max 15 degrees)
    const rotateXValue = (mouseY / (rect.height / 2)) * -8;
    const rotateYValue = (mouseX / (rect.width / 2)) * 8;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: 'easeOut'
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg cursor-pointer will-change-transform"
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-secondary/50">
        {product.image_url ? (
          <motion.img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            style={{ transform: 'translateZ(20px)' }}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Sale badge */}
        {isOnSale && (
          <motion.div 
            className="absolute top-3 left-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
              {t('sale')}
            </span>
          </motion.div>
        )}
        
        {/* Stock urgency indicator */}
        {isLowStock && (
          <motion.div 
            className="absolute bottom-3 left-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning text-warning-foreground">
              <AlertTriangle className="w-3 h-3" />
              {product.stock} {t('unitsLeft')}
            </span>
          </motion.div>
        )}
        
        {/* Wishlist button */}
        <motion.button
          onClick={handleWishlistClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all",
            inWishlist 
              ? "bg-destructive text-destructive-foreground" 
              : "bg-background/80 hover:bg-background text-foreground"
          )}
        >
          <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
        </motion.button>
        
        {/* Out of stock overlay */}
        {!isInStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-sm font-medium">
              {t('outOfStock')}
            </span>
          </div>
        )}
        
        {/* View details overlay */}
        {isInStock && (
          <motion.div 
            className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
            initial={false}
          >
            <motion.span 
              className="bg-background/90 px-4 py-2 rounded-full text-sm font-medium"
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              style={{ opacity: 0 }}
            >
              View Details
            </motion.span>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <motion.div 
        className="p-4"
        style={{ transform: 'translateZ(10px)' }}
      >
        <h3 className="font-display text-lg font-semibold text-foreground mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        {/* Star Rating */}
        <div className="mb-2">
          <StarRating rating={mockRating} size="sm" />
        </div>
        
        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 font-body">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">
              ${displayPrice.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
