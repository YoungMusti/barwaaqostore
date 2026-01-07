import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { PaymentModal } from './PaymentModal';

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalAmount, isOpen, setIsOpen } = useCart();
  const { t } = useLanguage();
  const [showPayment, setShowPayment] = useState(false);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-display text-xl">{t('yourCart')}</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">{t('emptyCart')}</p>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                {t('continueShopping')}
              </Button>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {items.map(item => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 bg-secondary/50 rounded-xl"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-1 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-lg font-semibold mt-1">${item.product.price.toFixed(2)}</p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-background border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-7 h-7 rounded-full bg-background border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>{t('total')}</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    setShowPayment(true);
                  }}
                  className="w-full h-12 text-base rounded-xl bg-primary hover:bg-accent"
                >
                  {t('checkout')}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <PaymentModal open={showPayment} onOpenChange={setShowPayment} />
    </>
  );
}
