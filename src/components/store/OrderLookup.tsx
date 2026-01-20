import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, CheckCircle, Clock, Truck, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { Order, OrderStatus } from '@/types/database';
import { cn } from '@/lib/utils';

const statusConfig: Record<OrderStatus, { icon: typeof Package; color: string; label: string; labelSo: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending', labelSo: 'La sugayo' },
  paid: { icon: CheckCircle, color: 'text-blue-500', label: 'Paid', labelSo: 'La bixiyey' },
  processing: { icon: Package, color: 'text-primary', label: 'Processing', labelSo: 'La diyaarinayo' },
  completed: { icon: Truck, color: 'text-success', label: 'Delivered', labelSo: 'La gaarsiiyey' },
  cancelled: { icon: XCircle, color: 'text-destructive', label: 'Cancelled', labelSo: 'La joojiyey' },
};

export function OrderLookup() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  const handleSearch = async () => {
    if (!phone.trim()) return;
    
    setIsLoading(true);
    setSearched(true);
    
    // Normalize phone number
    let searchPhone = phone.trim();
    if (!searchPhone.startsWith('+252')) {
      searchPhone = '+252' + searchPhone.replace(/^0+/, '');
    }

    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_phone', searchPhone)
      .order('created_at', { ascending: false })
      .limit(5);

    setOrders((data || []) as Order[]);
    setIsLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'so' ? 'so-SO' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Package className="w-4 h-4" />
          {language === 'so' ? 'Raad Raac Dalabka' : 'Track Order'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Package className="w-5 h-5" />
            {language === 'so' ? 'Raad Raac Dalabkaaga' : 'Track Your Order'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              placeholder={language === 'so' ? 'Geli telefoonkaaga...' : 'Enter your phone...'}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              </motion.div>
            ) : searched && orders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center text-muted-foreground"
              >
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>{language === 'so' ? 'Ma jiraan dalabyo' : 'No orders found'}</p>
              </motion.div>
            ) : orders.length > 0 ? (
              <motion.div
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 max-h-80 overflow-y-auto"
              >
                {orders.map((order) => {
                  const config = statusConfig[order.status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-secondary/50 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.created_at)}
                          </p>
                          <p className="font-semibold">${order.total_amount.toFixed(2)}</p>
                        </div>
                        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full bg-card text-sm", config.color)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{language === 'so' ? config.labelSo : config.label}</span>
                        </div>
                      </div>
                      
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {order.order_items.map((item, i) => (
                            <span key={item.id}>
                              {item.product_name} x{item.quantity}
                              {i < order.order_items!.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
