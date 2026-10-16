import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AlertTriangle, DollarSign, ShoppingCart, Clock, Trophy, Users, Tags } from 'lucide-react';
import { adjustPrice, buildCustomers, dailySummary } from '@/lib/insights';

type P = { id: string; name: string; price: number; stock: number; image_url: string | null; category_id: string | null; low_stock_threshold: number };
type C = { id: string; name: string };

export function AdminInsights() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<P[]>([]);
  const [cats, setCats] = useState<C[]>([]);
  const [bulkCat, setBulkCat] = useState('all');
  const [mode, setMode] = useState<'add' | 'percent' | 'set'>('add');
  const [value, setValue] = useState('4');
  const [busy, setBusy] = useState(false);
  const [custQ, setCustQ] = useState('');

  const load = async () => {
    const [o, p, c] = await Promise.all([
      supabase.from('orders').select('customer_name, customer_phone, total_amount, created_at, payment_status, order_items(product_name, quantity, price)'),
      supabase.from('products').select('id, name, price, stock, image_url, category_id, low_stock_threshold').order('stock'),
      supabase.from('categories').select('id, name'),
    ]);
    setOrders(o.data || []); setProducts((p.data || []) as P[]); setCats((c.data || []) as C[]);
  };
  useEffect(() => { load(); }, []);

  const summary = useMemo(() => dailySummary(orders), [orders]);
  const customers = useMemo(() => buildCustomers(orders).filter(c =>
    !custQ || c.name.toLowerCase().includes(custQ.toLowerCase()) || c.phone.replace(/\D/g, '').includes(custQ.replace(/\D/g, ''))), [orders, custQ]);
  const lowStock = products.filter(p => p.stock <= Math.min(3, p.low_stock_threshold ?? 3));
  const targets = products.filter(p => bulkCat === 'all' || p.category_id === bulkCat);

  async function applyBulk() {
    const v = Number(value);
    if (Number.isNaN(v)) return toast.error('Enter a number');
    if (!confirm(`Change the price of ${targets.length} products?`)) return;
    setBusy(true);
    const results = await Promise.all(targets.map(p =>
      supabase.from('products').update({ price: adjustPrice(Number(p.price), mode, v) }).eq('id', p.id)));
    setBusy(false);
    const failed = results.filter(r => r.error).length;
    failed ? toast.error(`${failed} products failed to update`) : toast.success(`Updated ${targets.length} prices`);
    load();
  }

  async function restock(p: P, add: number) {
    const { error } = await supabase.from('products').update({ stock: p.stock + add }).eq('id', p.id);
    if (error) return toast.error('Could not restock');
    toast.success(`${p.name}: stock ${p.stock + add}`);
    setProducts(ps => ps.map(x => x.id === p.id ? { ...x, stock: x.stock + add } : x));
  }

  const Card = ({ icon: I, label, value }: any) => (
    <div className="rounded-2xl border bg-card p-4"><I className="w-5 h-5 text-primary mb-2" />
      <div className="text-2xl font-bold">{value}</div><div className="text-sm text-muted-foreground">{label}</div></div>
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Today</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card icon={ShoppingCart} label="Orders today" value={summary.orders} />
          <Card icon={DollarSign} label="Paid today" value={`$${summary.paid.toFixed(2)}`} />
          <Card icon={Clock} label="Waiting to be checked" value={`$${summary.toCheck.toFixed(2)}`} />
        </div>
        <div className="mt-3 rounded-2xl border p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-2"><Trophy className="w-4 h-4 text-primary" />Best sellers today</h3>
          {summary.best.length === 0 ? <p className="text-sm text-muted-foreground">No sales yet today.</p> :
            <ol className="text-sm space-y-1">{summary.best.map(([n, q]) => <li key={n}>{n} — <b>{q}</b> sold</li>)}</ol>}
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Tags className="w-5 h-5" />Change prices in bulk</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <select value={bulkCat} onChange={e => setBulkCat(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="all">All products</option>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={mode} onChange={e => setMode(e.target.value as any)} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="add">Add / subtract $</option><option value="percent">Change by %</option><option value="set">Set price to $</option>
          </select>
          <Input value={value} onChange={e => setValue(e.target.value)} className="w-28" type="number" step="0.01" />
          <Button onClick={applyBulk} disabled={busy || !targets.length}>Apply to {targets.length}</Button>
        </div>
        {targets[0] && <p className="text-xs text-muted-foreground mt-2">Example: {targets[0].name} ${Number(targets[0].price).toFixed(2)} → ${adjustPrice(Number(targets[0].price), mode, Number(value) || 0).toFixed(2)}</p>}
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-warning" />Low stock ({lowStock.length})</h2>
        {lowStock.length === 0 ? <p className="text-sm text-muted-foreground">Everything is well stocked.</p> :
          <div className="divide-y">{lowStock.map(p => (
            <div key={p.id} className="flex items-center gap-3 py-2">
              {p.image_url && <img src={p.image_url} alt="" className="w-10 h-10 rounded object-cover" />}
              <div className="flex-1 min-w-0"><div className="truncate font-medium">{p.name}</div>
                <div className={`text-xs ${p.stock === 0 ? 'text-destructive' : 'text-warning'}`}>{p.stock === 0 ? 'Sold out' : `${p.stock} left`}</div></div>
              <Button size="sm" variant="outline" onClick={() => restock(p, 5)}>+5</Button>
              <Button size="sm" variant="outline" onClick={() => restock(p, 10)}>+10</Button>
            </div>))}</div>}
      </section>

      <section className="rounded-2xl border p-4">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2"><Users className="w-5 h-5" />Customers ({customers.length})</h2>
        <Input placeholder="Search name or phone" value={custQ} onChange={e => setCustQ(e.target.value)} className="mb-3 max-w-sm" />
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr><th className="py-2">Name</th><th>Phone</th><th>Orders</th><th>Spent</th><th>Last order</th></tr></thead>
          <tbody>{customers.map(c => (
            <tr key={c.phone} className="border-t"><td className="py-2 font-medium">{c.name}{c.orders > 1 && <span className="ml-2 text-xs rounded-full bg-primary/10 text-primary px-2">Repeat</span>}</td>
              <td><a className="text-primary" href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{c.phone}</a></td>
              <td>{c.orders}</td><td>${c.spent.toFixed(2)}</td><td>{new Date(c.last).toLocaleDateString()}</td></tr>))}</tbody>
        </table></div>
      </section>
    </div>
  );
}
