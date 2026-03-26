import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart, getEffectivePrice } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Phone, Receipt, Loader2, User, MapPin, Truck, Store, MessageCircle, ShoppingBag } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EVC_BUSINESS_NUMBER = '612502108';
const SALAAM_ACCOUNT = '38512769';
const DELIVERY_FEE = 2;
const WHATSAPP_NUMBER = '252612502108';

const PHONE_REGEX = /^\+252[0-9]{8,9}$/;
const MAX_REFERENCE_LENGTH = 100;

type PaymentMethod = 'EVC' | 'SALAAM';
type DeliveryMethod = 'collection' | 'delivery';

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const { items, totalAmount, clearCart } = useCart();
  const { t } = useLanguage();
  const [step, setStep] = useState<'review' | 'payment' | 'success'>('review');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('collection');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EVC');
  const [phone, setPhone] = useState('+252');
  const [reference, setReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const deliveryFee = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;
  const finalTotal = totalAmount + deliveryFee;

  const evcDialCode = `*712*${EVC_BUSINESS_NUMBER}*${Math.round(finalTotal)}#`;

  const validateReview = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) newErrors.phone = 'Phone number is required';
    else if (!PHONE_REGEX.test(trimmedPhone)) newErrors.phone = 'Invalid format. Use +252 followed by 8-9 digits';
    const trimmedRef = reference.trim();
    if (!trimmedRef) newErrors.reference = 'Payment reference is required';
    else if (trimmedRef.length > MAX_REFERENCE_LENGTH) newErrors.reference = `Max ${MAX_REFERENCE_LENGTH} characters`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validatePayment()) return;
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    setIsLoading(true);
    try {
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        selected_size: item.selectedSize || null,
        selected_color: item.selectedColor || null,
      }));

      const { data, error } = await supabase.rpc('create_validated_order', {
        _customer_phone: phone.trim(),
        _payment_reference: `[${paymentMethod}] ${reference.trim()} | ${fullName.trim()} | ${location.trim()} | ${deliveryMethod}`,
        _payment_method: paymentMethod,
        _items: orderItems,
      });

      if (error) throw error;
      if (data && data.length > 0 && data[0].error_message) {
        toast.error(data[0].error_message);
        return;
      }

      clearCart();
      setStep('success');
    } catch (error: any) {
      console.error('Order error:', error);
      if (error.message?.includes('check_phone_format')) {
        setErrors({ phone: 'Invalid phone format' });
      } else {
        toast.error('Failed to create order. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('review');
    setFullName('');
    setLocation('');
    setDeliveryMethod('collection');
    setPaymentMethod('EVC');
    setPhone('+252');
    setReference('');
    setErrors({});
  };

  const handlePhoneChange = (value: string) => {
    if (!value.startsWith('+252')) value = '+252' + value.replace(/^\+?252?/, '');
    const cleaned = '+252' + value.slice(4).replace(/[^0-9]/g, '');
    setPhone(cleaned.slice(0, 13));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined as any }));
  };

  const openWhatsApp = () => {
    const itemsList = items.map(item => {
      const price = getEffectivePrice(item.product);
      return `• ${item.product.name}${item.selectedSize ? ` (Size: ${item.selectedSize})` : ''}${item.selectedColor ? ` (${item.selectedColor})` : ''} x${item.quantity} - $${(price * item.quantity).toFixed(2)}`;
    }).join('\n');

    const msg = encodeURIComponent(
      `🛒 *New Order - Barwaaqo Store*\n\n` +
      `👤 Name: ${fullName}\n📍 Location: ${location}\n🚚 ${deliveryMethod === 'delivery' ? 'Delivery' : 'Collection'}\n💳 ${paymentMethod}\n📱 ${phone}\n🧾 Ref: ${reference}\n\n` +
      `*Items:*\n${itemsList}\n\n` +
      `${deliveryMethod === 'delivery' ? `🚚 Delivery Fee: $${DELIVERY_FEE.toFixed(2)}\n` : ''}` +
      `💰 *Total: $${finalTotal.toFixed(2)}*`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 'success' ? (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">{t('thankYou')}</h2>
            <p className="text-muted-foreground mb-4">Your order has been placed! Please contact us on WhatsApp to confirm.</p>
            <Button onClick={openWhatsApp} className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white mb-3">
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact on WhatsApp
            </Button>
            <Button variant="outline" onClick={handleClose} className="rounded-full">
              {t('backToShop')}
            </Button>
          </div>
        ) : step === 'review' ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Order Summary</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Order items */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.map((item, i) => {
                  const price = getEffectivePrice(item.product);
                  return (
                    <div key={i} className="flex gap-3 p-2 bg-secondary/50 rounded-xl">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.product.image_url ? (
                          <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {item.selectedSize && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Size: {item.selectedSize}</span>}
                          {item.selectedColor && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.selectedColor}</span>}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                          <span className="font-semibold text-sm">${(price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customer info */}
              <div className="space-y-3 border-t pt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" /> Full Name
                  </Label>
                  <Input id="fullName" placeholder="Enter your full name" value={fullName}
                    onChange={e => { setFullName(e.target.value); if (errors.fullName) setErrors(p => ({ ...p, fullName: undefined as any })); }}
                    className={`h-11 rounded-xl ${errors.fullName ? 'border-destructive' : ''}`} />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" /> Location / Address
                  </Label>
                  <Input id="location" placeholder="Enter your location" value={location}
                    onChange={e => { setLocation(e.target.value); if (errors.location) setErrors(p => ({ ...p, location: undefined as any })); }}
                    className={`h-11 rounded-xl ${errors.location ? 'border-destructive' : ''}`} />
                  {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
                </div>
              </div>

              {/* Collection / Delivery */}
              <div className="space-y-2 border-t pt-3">
                <Label className="text-sm font-medium">How would you like to receive your order?</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryMethod('collection')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${deliveryMethod === 'collection' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'}`}
                  >
                    <Store className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-sm font-medium">Collection</p>
                    <p className="text-xs text-muted-foreground">Free</p>
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${deliveryMethod === 'delivery' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'}`}
                  >
                    <Truck className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-sm font-medium">Delivery</p>
                    <p className="text-xs text-muted-foreground">+$2.00</p>
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>+${DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-1">
                  <span>{t('total')}</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={() => { if (validateReview()) setStep('payment'); }}
                className="w-full h-12 text-base rounded-xl bg-primary hover:bg-accent">
                Continue to Payment
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-2">
              {/* Payment method selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Choose Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('EVC')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === 'EVC' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'}`}
                  >
                    <p className="font-bold text-sm">EVC Plus</p>
                    <p className="text-xs text-muted-foreground">Hormuud</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('SALAAM')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === 'SALAAM' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'}`}
                  >
                    <p className="font-bold text-sm">Salaam Bank</p>
                    <p className="text-xs text-muted-foreground">Bank Transfer</p>
                  </button>
                </div>
              </div>

              {/* Payment instructions */}
              <div className="bg-secondary rounded-xl p-4 text-center">
                {paymentMethod === 'EVC' ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">{t('paymentInstructions')}</p>
                    <div className="bg-background rounded-lg p-3 font-mono text-lg font-bold text-primary">
                      {evcDialCode}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">Send to this Salaam Bank account:</p>
                    <div className="bg-background rounded-lg p-3 font-mono text-lg font-bold text-primary">
                      {SALAAM_ACCOUNT}
                    </div>
                  </>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Amount: <span className="font-semibold">${finalTotal.toFixed(2)}</span>
                </p>
              </div>

              {/* Phone & Reference */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" /> {t('enterPhone')}
                  </Label>
                  <Input id="phone" type="tel" placeholder="+252 61 xxx xxxx" value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    className={`h-11 rounded-xl ${errors.phone ? 'border-destructive' : ''}`} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reference" className="flex items-center gap-2 text-sm">
                    <Receipt className="w-4 h-4" /> {paymentMethod === 'EVC' ? t('enterReference') : 'Salaam Bank Reference'}
                  </Label>
                  <Input id="reference" placeholder={paymentMethod === 'EVC' ? 'EVC Reference / Tixraaca' : 'Salaam Bank Reference'}
                    value={reference} onChange={e => { if (e.target.value.length <= MAX_REFERENCE_LENGTH) { setReference(e.target.value); if (errors.reference) setErrors(p => ({ ...p, reference: undefined as any })); } }}
                    className={`h-11 rounded-xl ${errors.reference ? 'border-destructive' : ''}`} maxLength={MAX_REFERENCE_LENGTH} />
                  {errors.reference && <p className="text-xs text-destructive">{errors.reference}</p>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('review')} className="rounded-xl">Back</Button>
                <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 h-12 text-base rounded-xl bg-primary hover:bg-accent">
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : t('confirmPayment')}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
