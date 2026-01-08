import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart, getEffectivePrice } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Phone, Receipt, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BUSINESS_NUMBER = '612502108';

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const { items, totalAmount, clearCart } = useCart();
  const { t } = useLanguage();
  const [step, setStep] = useState<'payment' | 'confirm' | 'success'>('payment');
  const [phone, setPhone] = useState('');
  const [reference, setReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dialCode = `*712*${BUSINESS_NUMBER}*${Math.round(totalAmount)}#`;

  const handleSubmit = async () => {
    if (!phone.trim() || !reference.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_phone: phone,
          total_amount: totalAmount,
          payment_reference: reference,
          payment_method: 'EVC',
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items - use effective price (sale price if on sale)
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: getEffectivePrice(item.product),
        selected_size: item.selectedSize || null,
        selected_color: item.selectedColor || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      setStep('success');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('payment');
    setPhone('');
    setReference('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'success' ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">{t('thankYou')}</h2>
            <p className="text-muted-foreground mb-6">{t('orderConfirmed')}</p>
            <Button onClick={handleClose} className="rounded-full">
              {t('backToShop')}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{t('payWithEVC')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Payment instructions */}
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">{t('paymentInstructions')}</p>
                <div className="bg-background rounded-lg p-3 font-mono text-lg font-bold text-primary">
                  {dialCode}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Amount / Qadarka: <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                </p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('enterPhone')}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+252 61 xxx xxxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference" className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    {t('enterReference')}
                  </Label>
                  <Input
                    id="reference"
                    type="text"
                    placeholder="EVC Reference / Tixraaca"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-12 text-base rounded-xl bg-primary hover:bg-accent"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  t('confirmPayment')
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
