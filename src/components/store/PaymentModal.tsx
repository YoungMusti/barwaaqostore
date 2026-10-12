import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCart, getEffectivePrice } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Phone, Receipt, Loader2, User, MapPin, Truck, Store, ShoppingBag, Clock, Copy, Building2, Navigation } from 'lucide-react';
import { DELIVERY_FEE, orderCost, validateCheckoutDetails, PAYMENT_STATUSES, FULFILMENT_STATUSES, PAYMENT_METHOD_LABELS, PaymentStatus } from '@/lib/orders';
import type { CartItem } from '@/types/database';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EVC_BUSINESS_NUMBER = '612502108';
const SALAAM_ACCOUNT = '38512769';

type PaymentMethod = 'EVC' | 'SALAAM';
type DeliveryMethod = 'collection' | 'delivery';

interface PlacedOrder {
  orderNumber: string;
  total: number;
  items: CartItem[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  city: string;
  area: string;
  directions: string;
  reference: string;
  paymentDate: string;
}

function Field({ id, label, icon: Icon, required, optional, error, hint, children }: {
  id: string; label: string; icon?: any; required?: boolean; optional?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-2 text-sm">
        {Icon && <Icon className="w-4 h-4" />} {label}
        {required && <span className="text-destructive">*</span>}
        {optional && <span className="text-xs text-muted-foreground">(Optional)</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const { items, totalAmount, clearCart } = useCart();
  const { t } = useLanguage();
  const [step, setStep] = useState<'review' | 'payment' | 'success'>('review');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+252');
  const [altPhone, setAltPhone] = useState('+252');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('collection');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [directions, setDirections] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EVC');
  const [reference, setReference] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [payerPhone, setPayerPhone] = useState('+252');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  const cost = orderCost(totalAmount, deliveryMethod);
  const evcDialCode = `*712*${EVC_BUSINESS_NUMBER}*${Math.round(cost.total)}#`;
  const clearError = (k: string) => errors[k] && setErrors(p => { const n = { ...p }; delete n[k]; return n; });

  const cleanPhone = (value: string) => {
    if (!value.startsWith('+252')) value = '+252' + value.replace(/^\+?252?/, '');
    return ('+252' + value.slice(4).replace(/[^0-9]/g, '')).slice(0, 13);
  };
  const optionalPhone = (v: string) => (v.trim() === '+252' ? null : v.trim() || null);

  const validateReview = () => {
    const e = validateCheckoutDetails({ fullName, phone, deliveryMethod, city, area, directions, altPhone: optionalPhone(altPhone) || '' });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    const payer = optionalPhone(payerPhone);
    if (payer && !/^\+252[0-9]{8,9}$/.test(payer)) e.payerPhone = 'Use +252 followed by 8-9 digits';
    setErrors(e);
    if (Object.keys(e).length) return;
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_order_v2', {
        _customer_name: fullName.trim(),
        _customer_phone: phone.trim(),
        _delivery_method: deliveryMethod,
        _delivery_city: deliveryMethod === 'delivery' ? city.trim() : null,
        _delivery_area: deliveryMethod === 'delivery' ? area.trim() : null,
        _delivery_directions: deliveryMethod === 'delivery' ? directions.trim() : null,
        _alt_phone: optionalPhone(altPhone),
        _delivery_instructions: deliveryMethod === 'delivery' ? instructions.trim() || null : null,
        _payment_method: paymentMethod,
        _transaction_ref: reference.trim() || null,
        _payment_datetime: paymentDate.trim() || null,
        _payer_phone: payer,
        _order_notes: note.trim() || null,
        _items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          selected_size: item.selectedSize || null,
          selected_color: item.selectedColor || null,
        })),
      } as any);
      if (error) throw error;
      const row = (data as any[])?.[0];
      if (!row || row.error_message || !row.order_number) {
        toast.error(row?.error_message || 'Your order could not be saved. Please try again.');
        return;
      }
      setPlaced({
        orderNumber: row.order_number,
        total: Number(row.total_amount),
        items: [...items],
        paymentMethod,
        paymentStatus: reference.trim() || paymentDate.trim() ? 'verification_pending' : 'awaiting_payment',
        deliveryMethod, city, area, directions,
        reference: reference.trim(), paymentDate: paymentDate.trim(),
      });
      clearCart();
      setStep('success');
    } catch (err) {
      console.error('Order error:', err);
      toast.error('Your order could not be saved. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('review');
    setFullName(''); setPhone('+252'); setAltPhone('+252');
    setDeliveryMethod('collection'); setCity(''); setArea(''); setDirections(''); setInstructions('');
    setPaymentMethod('EVC'); setReference(''); setPaymentDate(''); setPayerPhone('+252'); setNote('');
    setErrors({}); setPlaced(null);
  };

  const copyNumber = async (n: string) => {
    try { await navigator.clipboard.writeText(n); toast.success('Order number copied'); } catch { toast.error('Could not copy'); }
  };

  const CostBreakdown = ({ total }: { total?: number }) => (
    <div className="border-t pt-3 space-y-1">
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Item subtotal</span><span>${cost.subtotal.toFixed(2)}</span></div>
      {deliveryMethod === 'delivery' && (
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery fee</span><span>+${DELIVERY_FEE.toFixed(2)}</span></div>
      )}
      {cost.discount > 0 && (
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span>-${cost.discount.toFixed(2)}</span></div>
      )}
      <div className="flex justify-between text-lg font-bold pt-1"><span>Total payable</span><span>${(total ?? cost.total).toFixed(2)}</span></div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 'success' && placed ? (
          <div className="py-2 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-success" />
              </div>
              <h2 className="font-display text-2xl font-semibold">Order placed!</h2>
              <p className="text-sm text-muted-foreground">Keep your order number and quote it when you contact Barwaaqo Shop.</p>
            </div>

            <button onClick={() => copyNumber(placed.orderNumber)}
              className="w-full flex items-center justify-between gap-3 rounded-xl border-2 border-primary bg-primary/5 px-4 py-3">
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Order number</p>
                <p className="font-mono text-2xl font-bold text-primary select-all">{placed.orderNumber}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-primary"><Copy className="w-4 h-4" /> Copy</span>
            </button>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Payment: {PAYMENT_STATUSES[placed.paymentStatus]}</Badge>
              <Badge variant="outline">Order: {FULFILMENT_STATUSES.new}</Badge>
            </div>

            <div className="space-y-2 rounded-xl bg-secondary/50 p-3">
              {placed.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.quantity} × {item.product.name}{item.selectedSize ? ` (Size ${item.selectedSize})` : ''}</span>
                  <span>${(getEffectivePrice(item.product) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-bold"><span>Total</span><span>${placed.total.toFixed(2)}</span></div>
            </div>

            <div className="rounded-xl border p-3 text-sm space-y-1">
              <p><span className="text-muted-foreground">Payment method:</span> {PAYMENT_METHOD_LABELS[placed.paymentMethod]}</p>
              {placed.paymentMethod === 'EVC'
                ? <p><span className="text-muted-foreground">Pay with:</span> <span className="font-mono">*712*{EVC_BUSINESS_NUMBER}*{Math.round(placed.total)}#</span></p>
                : <p><span className="text-muted-foreground">Salaam Bank account:</span> <span className="font-mono">{SALAAM_ACCOUNT}</span></p>}
              {placed.reference && <p><span className="text-muted-foreground">Reference:</span> {placed.reference}</p>}
              {placed.paymentDate && <p><span className="text-muted-foreground">Paid on:</span> {placed.paymentDate}</p>}
              {placed.paymentStatus === 'awaiting_payment' && <p className="text-warning">We haven’t received payment details yet — please pay and send us your receipt with your order number.</p>}
              {placed.paymentStatus === 'verification_pending' && <p className="text-muted-foreground">We’ll check your payment and confirm it shortly.</p>}
            </div>

            {placed.deliveryMethod === 'delivery' ? (
              <div className="rounded-xl border p-3 text-sm space-y-1">
                <p className="font-medium flex items-center gap-2"><Truck className="w-4 h-4" /> Delivery to {placed.city}, {placed.area}</p>
                <p className="text-muted-foreground whitespace-pre-line">{placed.directions}</p>
              </div>
            ) : (
              <p className="text-sm flex items-center gap-2"><Store className="w-4 h-4" /> Collection from our shop</p>
            )}

            <Button variant="outline" onClick={handleClose} className="w-full rounded-full">{t('backToShop')}</Button>
          </div>
        ) : step === 'review' ? (
          <>
            <DialogHeader><DialogTitle className="font-display text-xl">Order Summary</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.map((item, i) => {
                  const price = getEffectivePrice(item.product);
                  return (
                    <div key={i} className="flex gap-3 p-2 bg-secondary/50 rounded-xl">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.product.image_url
                          ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-muted-foreground/30" /></div>}
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

              <div className="space-y-3 border-t pt-3">
                <Field id="fullName" label="Full Name" icon={User} required error={errors.fullName}>
                  <Input id="fullName" placeholder="Enter your full name" value={fullName} maxLength={100}
                    onChange={e => { setFullName(e.target.value); clearError('fullName'); }}
                    className={`h-11 rounded-xl ${errors.fullName ? 'border-destructive' : ''}`} />
                </Field>
                <Field id="phone" label="Contact Phone Number" icon={Phone} required error={errors.phone}>
                  <Input id="phone" type="tel" placeholder="+252 61 xxx xxxx" value={phone}
                    onChange={e => { setPhone(cleanPhone(e.target.value)); clearError('phone'); }}
                    className={`h-11 rounded-xl ${errors.phone ? 'border-destructive' : ''}`} />
                </Field>
                <Field id="altPhone" label="Alternative Phone Number" icon={Phone} optional error={errors.altPhone}>
                  <Input id="altPhone" type="tel" placeholder="+252 61 xxx xxxx" value={altPhone}
                    onChange={e => { setAltPhone(cleanPhone(e.target.value)); clearError('altPhone'); }}
                    className={`h-11 rounded-xl ${errors.altPhone ? 'border-destructive' : ''}`} />
                </Field>
              </div>

              <div className="space-y-2 border-t pt-3">
                <Label className="text-sm font-medium">How would you like to receive your order?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['collection', 'delivery'] as const).map(m => (
                    <button key={m} type="button" onClick={() => setDeliveryMethod(m)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${deliveryMethod === m ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'}`}>
                      {m === 'collection' ? <Store className="w-5 h-5 mx-auto mb-1" /> : <Truck className="w-5 h-5 mx-auto mb-1" />}
                      <p className="text-sm font-medium">{m === 'collection' ? 'Collection' : 'Delivery'}</p>
                      <p className="text-xs text-muted-foreground">{m === 'collection' ? 'Free' : `+$${DELIVERY_FEE.toFixed(2)}`}</p>
                    </button>
                  ))}
                </div>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="space-y-3 rounded-xl bg-secondary/40 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field id="city" label="City" icon={Building2} required error={errors.city}>
                      <Input id="city" placeholder="e.g. Mogadishu" value={city} maxLength={80}
                        onChange={e => { setCity(e.target.value); clearError('city'); }}
                        className={`h-11 rounded-xl ${errors.city ? 'border-destructive' : ''}`} />
                    </Field>
                    <Field id="area" label="Area / District" icon={MapPin} required error={errors.area}>
                      <Input id="area" placeholder="e.g. Hodan" value={area} maxLength={120}
                        onChange={e => { setArea(e.target.value); clearError('area'); }}
                        className={`h-11 rounded-xl ${errors.area ? 'border-destructive' : ''}`} />
                    </Field>
                  </div>
                  <Field id="directions" label="How to Find Your Location" icon={Navigation} required error={errors.directions}
                    hint="No street address or postcode needed — landmarks are perfect.">
                    <Textarea id="directions" rows={3} maxLength={1000} value={directions}
                      placeholder="Describe your location using nearby landmarks, shops, mosques, roads, junctions or other recognisable places. Explain how our delivery driver can find you."
                      onChange={e => { setDirections(e.target.value); clearError('directions'); }}
                      className={`rounded-xl resize-none ${errors.directions ? 'border-destructive' : ''}`} />
                  </Field>
                  <Field id="instructions" label="Additional Delivery Instructions" optional>
                    <Textarea id="instructions" rows={2} maxLength={500} value={instructions}
                      placeholder="e.g. Call when you reach the mosque, best time after 4pm"
                      onChange={e => setInstructions(e.target.value)} className="rounded-xl resize-none" />
                  </Field>
                </div>
              )}

              <CostBreakdown />

              <Button onClick={() => { if (validateReview()) setStep('payment'); }} className="w-full h-12 text-base rounded-xl">
                Continue to Payment
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader><DialogTitle className="font-display text-xl">Payment</DialogTitle></DialogHeader>
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Choose Payment Method</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['EVC', 'SALAAM'] as const).map(m => (
                    <button key={m} type="button" onClick={() => setPaymentMethod(m)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === m ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/30'}`}>
                      <p className="font-bold text-sm">{PAYMENT_METHOD_LABELS[m]}</p>
                      <p className="text-xs text-muted-foreground">{m === 'EVC' ? 'Hormuud' : 'Bank Transfer'}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {paymentMethod === 'EVC' ? t('paymentInstructions') : 'Send to this Salaam Bank account:'}
                </p>
                <div className="bg-background rounded-lg p-3 font-mono text-lg font-bold text-primary">
                  {paymentMethod === 'EVC' ? evcDialCode : SALAAM_ACCOUNT}
                </div>
                <p className="text-sm mt-3">Amount to pay: <span className="font-bold text-lg">${cost.total.toFixed(2)}</span></p>
              </div>

              <div className="space-y-3">
                <Field id="reference" label={paymentMethod === 'EVC' ? 'EVC Transaction Reference / ID' : 'Bank Transfer Reference'} icon={Receipt} optional
                  hint="Enter it if your receipt shows one. Leave blank if there isn’t one.">
                  <Input id="reference" maxLength={100} value={reference} onChange={e => setReference(e.target.value)}
                    placeholder={paymentMethod === 'EVC' ? 'e.g. 1234567890' : 'e.g. SB-000123'} className="h-11 rounded-xl" />
                </Field>
                <Field id="paymentDate" label="Transaction Date & Time" icon={Clock} optional>
                  <Input id="paymentDate" type="datetime-local" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="h-11 rounded-xl" />
                </Field>
                <Field id="payerPhone" label="Phone Number That Paid (if different)" icon={Phone} optional error={errors.payerPhone}>
                  <Input id="payerPhone" type="tel" value={payerPhone} onChange={e => { setPayerPhone(cleanPhone(e.target.value)); clearError('payerPhone'); }}
                    className={`h-11 rounded-xl ${errors.payerPhone ? 'border-destructive' : ''}`} />
                </Field>
                <Field id="note" label="Payment Note" optional>
                  <Textarea id="note" maxLength={500} placeholder="Anything we should know about your payment or order..."
                    value={note} onChange={e => setNote(e.target.value)} className="rounded-xl min-h-[70px] resize-none" rows={2} />
                </Field>
              </div>

              <CostBreakdown />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('review')} className="rounded-xl">Back</Button>
                <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 h-12 text-base rounded-xl">
                  {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Placing order...</> : 'Place Order'}
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">Your payment will be checked by our team before the order is confirmed.</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
