import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Phone, Receipt, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BUSINESS_NUMBER = '612502108';

// Phone validation regex: +252 followed by 8-9 digits
const PHONE_REGEX = /^\+252[0-9]{8,9}$/;
const MAX_REFERENCE_LENGTH = 100;

export function PaymentModal({ open, onOpenChange }: PaymentModalProps) {
  const { items, totalAmount, clearCart } = useCart();
  const { t } = useLanguage();
  const [step, setStep] = useState<'payment' | 'confirm' | 'success'>('payment');
  const [phone, setPhone] = useState('+252');
  const [reference, setReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; reference?: string }>({});

  const dialCode = `*712*${BUSINESS_NUMBER}*${Math.round(totalAmount)}#`;

  const validateInputs = (): boolean => {
    const newErrors: { phone?: string; reference?: string } = {};
    
    // Validate phone format
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (!PHONE_REGEX.test(trimmedPhone)) {
      newErrors.phone = 'Invalid format. Use +252 followed by 8-9 digits (e.g., +252612345678)';
    }
    
    // Validate reference
    const trimmedReference = reference.trim();
    if (!trimmedReference) {
      newErrors.reference = 'Payment reference is required';
    } else if (trimmedReference.length > MAX_REFERENCE_LENGTH) {
      newErrors.reference = `Reference too long (max ${MAX_REFERENCE_LENGTH} characters)`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (!validateInputs()) {
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare items for the secure function
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        selected_size: item.selectedSize || null,
        selected_color: item.selectedColor || null,
      }));

      // Use secure database function that validates and calculates prices server-side
      const { data, error } = await supabase.rpc('create_validated_order', {
        _customer_phone: phone.trim(),
        _payment_reference: reference.trim(),
        _payment_method: 'EVC',
        _items: orderItems,
      });

      if (error) throw error;

      // Check for validation errors from the function
      if (data && data.length > 0) {
        const result = data[0];
        if (result.error_message) {
          toast.error(result.error_message);
          return;
        }
      }

      clearCart();
      setStep('success');
    } catch (error: any) {
      console.error('Order error:', error);
      
      // Handle specific database constraint errors
      if (error.message?.includes('check_phone_format')) {
        setErrors({ phone: 'Invalid phone format. Use +252 followed by 8-9 digits' });
      } else if (error.message?.includes('check_reference_length')) {
        setErrors({ reference: 'Reference too long (max 100 characters)' });
      } else {
        toast.error('Failed to create order. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep('payment');
    setPhone('+252');
    setReference('');
    setErrors({});
  };

  const handlePhoneChange = (value: string) => {
    // Ensure phone always starts with +252
    if (!value.startsWith('+252')) {
      value = '+252' + value.replace(/^\+?252?/, '');
    }
    // Only allow digits after +252
    const cleaned = '+252' + value.slice(4).replace(/[^0-9]/g, '');
    setPhone(cleaned.slice(0, 13)); // +252 + max 9 digits
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
  };

  const handleReferenceChange = (value: string) => {
    if (value.length <= MAX_REFERENCE_LENGTH) {
      setReference(value);
      if (errors.reference) setErrors(prev => ({ ...prev, reference: undefined }));
    }
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
                    onChange={e => handlePhoneChange(e.target.value)}
                    className={`h-12 rounded-xl ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-sm text-destructive">{errors.phone}</p>
                  )}
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
                    onChange={e => handleReferenceChange(e.target.value)}
                    className={`h-12 rounded-xl ${errors.reference ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    maxLength={MAX_REFERENCE_LENGTH}
                    aria-invalid={!!errors.reference}
                    aria-describedby={errors.reference ? 'reference-error' : undefined}
                  />
                  {errors.reference && (
                    <p id="reference-error" className="text-sm text-destructive">{errors.reference}</p>
                  )}
                  <p className="text-xs text-muted-foreground text-right">
                    {reference.length}/{MAX_REFERENCE_LENGTH}
                  </p>
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
