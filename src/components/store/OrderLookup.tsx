import { useState } from 'react';
import { Search, Package, Loader2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import { PAYMENT_STATUSES, FULFILMENT_STATUSES, PAYMENT_METHOD_LABELS } from '@/lib/orders';

export function OrderLookup() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const so = language === 'so';

  const handleSearch = async () => {
    if (!orderNumber.trim() || !phone.trim()) return;
    setIsLoading(true); setSearched(true);
    const { data } = await supabase.rpc('lookup_order', { _order_number: orderNumber.trim(), _phone: phone.trim() } as any);
    setOrder(data || null);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Package className="w-4 h-4" />{so ? 'Raad Raac Dalabka' : 'Track Order'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2"><Package className="w-5 h-5" />{so ? 'Raad Raac Dalabkaaga' : 'Track Your Order'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Input placeholder="Order number, e.g. BARWAAQO07" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} />
          <Input type="tel" placeholder={so ? 'Telefoonkaaga' : 'Phone number used for the order'} value={phone}
            onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch} disabled={isLoading} className="w-full gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} {so ? 'Raadi' : 'Find my order'}
          </Button>

          {searched && !isLoading && !order && (
            <p className="py-6 text-center text-sm text-muted-foreground">{so ? 'Dalab lama helin' : 'No order found. Check the order number and phone number.'}</p>
          )}
          {order && !isLoading && (
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2 text-sm">
              <button className="font-mono text-lg font-bold text-primary flex items-center gap-2"
                onClick={() => { navigator.clipboard?.writeText(order.order_number); toast.success('Order number copied'); }}>
                {order.order_number} <Copy className="w-4 h-4" />
              </button>
              <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Payment: {(PAYMENT_STATUSES as any)[order.payment_status]}</Badge>
                <Badge variant="outline">Order: {(FULFILMENT_STATUSES as any)[order.fulfilment_status]}</Badge>
              </div>
              {order.items?.map((it: any, i: number) => (
                <div key={i} className="flex justify-between"><span>{it.quantity} × {it.product_name}{it.selected_size ? ` (Size ${it.selected_size})` : ''}</span><span>${(it.price * it.quantity).toFixed(2)}</span></div>
              ))}
              <div className="flex justify-between border-t pt-2 font-bold"><span>Total</span><span>${Number(order.total_amount).toFixed(2)}</span></div>
              <p className="text-muted-foreground">{PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
                {order.delivery_method === 'delivery' ? ` · Delivery to ${[order.delivery_city, order.delivery_area].filter(Boolean).join(', ')}` : ' · Collection'}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
