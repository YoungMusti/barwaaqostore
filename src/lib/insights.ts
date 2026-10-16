export const SHOP_WHATSAPP = '252612502108';

export type OrderLite = {
  customer_name?: string | null; customer_phone: string; total_amount: number;
  created_at: string; payment_status?: string;
  order_items?: { product_name: string; quantity: number; price: number }[];
};

const digits = (p: string) => p.replace(/\D/g, '');

/** Group orders by phone into a customer list, most valuable first. Rejected/refunded orders don't count as spend. */
export function buildCustomers(orders: OrderLite[]) {
  const map = new Map<string, { phone: string; name: string; orders: number; spent: number; last: string }>();
  for (const o of orders) {
    const key = digits(o.customer_phone);
    const c = map.get(key) || { phone: o.customer_phone, name: o.customer_name || '—', orders: 0, spent: 0, last: o.created_at };
    c.orders += 1;
    if (o.payment_status !== 'rejected' && o.payment_status !== 'refunded') c.spent += Number(o.total_amount || 0);
    if (o.created_at > c.last) { c.last = o.created_at; if (o.customer_name) c.name = o.customer_name; }
    map.set(key, c);
  }
  return [...map.values()].sort((a, b) => b.spent - a.spent);
}

/** Today's summary: orders placed today, money confirmed paid, money waiting to be checked, best sellers. */
export function dailySummary(orders: OrderLite[], today = new Date().toISOString().slice(0, 10)) {
  const t = orders.filter(o => o.created_at.slice(0, 10) === today);
  const sum = (xs: OrderLite[]) => xs.reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const counts = new Map<string, number>();
  t.forEach(o => o.order_items?.forEach(i => counts.set(i.product_name, (counts.get(i.product_name) || 0) + i.quantity)));
  return {
    orders: t.length,
    paid: sum(t.filter(o => o.payment_status === 'paid')),
    toCheck: sum(orders.filter(o => o.payment_status === 'verification_pending')),
    best: [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}

/** New price after a bulk change; never below $0, rounded to cents. */
export function adjustPrice(price: number, mode: 'add' | 'percent' | 'set', value: number) {
  const n = mode === 'add' ? price + value : mode === 'percent' ? price * (1 + value / 100) : value;
  return Math.max(0, Math.round(n * 100) / 100);
}

export function whatsappOrderLink(name: string, price: string, url: string, size?: string | null) {
  const msg = `As-salaamu alaykum, I want to order: ${name}${size ? ` (Size ${size})` : ''} — ${price}\n${url}`;
  return `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}
