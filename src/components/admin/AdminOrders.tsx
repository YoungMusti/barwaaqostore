import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Search, Copy, AlertTriangle, Download, Package } from 'lucide-react';
import { PAYMENT_STATUSES, FULFILMENT_STATUSES, PAYMENT_METHOD_LABELS, PaymentStatus, FulfilmentStatus, orderMatchesSearch, duplicateReferenceOrders } from '@/lib/orders';

type AdminOrder = Record<string, any> & {
  id: string; order_number: string; created_at: string; total_amount: number;
  payment_status: PaymentStatus; fulfilment_status: FulfilmentStatus; order_items?: any[];
};
type History = { id: string; status_type: string; old_status: string | null; new_status: string; reason: string | null; changed_by_email: string | null; changed_at: string };

const payTone: Record<PaymentStatus, string> = {
  awaiting_payment: 'bg-muted text-muted-foreground',
  verification_pending: 'bg-warning/15 text-warning',
  paid: 'bg-success/15 text-success',
  rejected: 'bg-destructive/15 text-destructive',
  refunded: 'bg-secondary text-foreground',
};

const money = (n: any) => `$${Number(n || 0).toFixed(2)}`;
const when = (d: string) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const statusLabel = (type: string, s: string | null) => !s ? '—' : type === 'payment' ? (PAYMENT_STATUSES as any)[s] || s : (FULFILMENT_STATUSES as any)[s] || s;

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border p-4 space-y-2">
      <h3 className="text-sm font-semibold"><span className="text-primary mr-1">{n}.</span>{title}</h3>
      {children}
    </section>
  );
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="grid grid-cols-[140px_1fr] gap-2 text-sm"><span className="text-muted-foreground">{label}</span><span className="break-words">{value || '—'}</span></div>;
}

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [payFilter, setPayFilter] = useState('');
  const [fulFilter, setFulFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [pending, setPending] = useState<{ type: 'payment' | 'fulfilment'; status: string; override?: boolean; dups?: string[] } | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from('orders').select('*, order_items(*, products(image_url))').order('created_at', { ascending: false });
    if (error) toast.error('Could not load orders');
    setOrders((data || []) as any);
    setLoading(false);
  };
  const loadHistory = async (id: string) => {
    const { data } = await supabase.from('order_status_history').select('*').eq('order_id', id).order('changed_at', { ascending: false });
    setHistory((data || []) as History[]);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (openId) loadHistory(openId); }, [openId]);

  const filtered = useMemo(() => orders.filter(o => {
    if (!orderMatchesSearch(o, q)) return false;
    if (payFilter && o.payment_status !== payFilter) return false;
    if (fulFilter && o.fulfilment_status !== fulFilter) return false;
    if (methodFilter && o.payment_method !== methodFilter) return false;
    const d = o.created_at.slice(0, 10);
    if (dateFrom && d < dateFrom) return false;
    if (dateTo && d > dateTo) return false;
    return true;
  }), [orders, q, payFilter, fulFilter, methodFilter, dateFrom, dateTo]);

  const open = orders.find(o => o.id === openId) || null;
  const dups = open ? duplicateReferenceOrders(open, orders) : [];

  const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); toast.success(`${text} copied`); } catch { /* ignore */ } };

  const apply = async () => {
    if (!open || !pending) return;
    setBusy(true);
    try {
      if (pending.type === 'payment') {
        const { data, error } = await supabase.rpc('admin_set_payment_status', {
          _order_id: open.id, _new_status: pending.status, _reason: reason.trim() || null, _allow_duplicate: !!pending.override,
        } as any);
        if (error) throw error;
        const r = (data as any[])?.[0];
        if (!r?.ok) {
          if (r?.duplicate_order_numbers?.length) { setPending({ ...pending, dups: r.duplicate_order_numbers }); return; }
          toast.error(r?.message || 'Could not update'); return;
        }
      } else {
        const { data, error } = await supabase.rpc('admin_set_fulfilment_status', { _order_id: open.id, _new_status: pending.status, _note: reason.trim() || null } as any);
        if (error) throw error;
        const r = (data as any[])?.[0];
        if (!r?.ok) { toast.error(r?.message || 'Could not update'); return; }
      }
      toast.success('Status updated');
      setPending(null); setReason('');
      await load(); await loadHistory(open.id);
    } catch (e: any) {
      toast.error(e?.message || 'Could not update');
    } finally { setBusy(false); }
  };

  const exportCsv = () => {
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Order Number', 'Date', 'Name', 'Phone', 'Payment Method', 'Reference', 'Total', 'Payment Status', 'Order Status', 'City', 'Area'].join(',')];
    filtered.forEach(o => rows.push([o.order_number, when(o.created_at), o.customer_name, o.customer_phone, PAYMENT_METHOD_LABELS[o.payment_method] || o.payment_method,
      o.payment_transaction_ref, o.total_amount, PAYMENT_STATUSES[o.payment_status], FULFILMENT_STATUSES[o.fulfilment_status], o.delivery_city, o.delivery_area].map(esc).join(',')));
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const selectCls = 'h-10 rounded-md border bg-background px-2 text-sm';

  return (
    <div className="bg-card rounded-xl border p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-lg font-semibold">Orders ({filtered.length}{filtered.length !== orders.length ? ` of ${orders.length}` : ''})</h2>
        <Button variant="outline" size="sm" className="gap-2" onClick={exportCsv}><Download className="w-4 h-4" /> Export CSV</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} className="pl-9 h-11"
          placeholder="Search order number, name, phone, alternative/payer phone or transaction reference" />
      </div>
      <div className="flex flex-wrap gap-2">
        <select className={selectCls} value={payFilter} onChange={e => setPayFilter(e.target.value)} aria-label="Payment status">
          <option value="">All payment statuses</option>
          {Object.entries(PAYMENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className={selectCls} value={fulFilter} onChange={e => setFulFilter(e.target.value)} aria-label="Order status">
          <option value="">All order statuses</option>
          {Object.entries(FULFILMENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className={selectCls} value={methodFilter} onChange={e => setMethodFilter(e.target.value)} aria-label="Payment method">
          <option value="">All payment methods</option>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-auto h-10" aria-label="From date" />
        <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-auto h-10" aria-label="To date" />
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>{['Order', 'Customer', 'Phone', 'Date', 'Method', 'Total', 'Payment', 'Order status'].map(h => <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} onClick={() => setOpenId(o.id)} className="border-t cursor-pointer hover:bg-secondary/30">
                <td className="px-3 py-2 font-mono font-bold text-primary whitespace-nowrap">{o.order_number}</td>
                <td className="px-3 py-2">{o.customer_name || '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap">{o.customer_phone}</td>
                <td className="px-3 py-2 whitespace-nowrap">{when(o.created_at)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{PAYMENT_METHOD_LABELS[o.payment_method] || o.payment_method}</td>
                <td className="px-3 py-2 font-semibold">{money(o.total_amount)}</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${payTone[o.payment_status]}`}>{PAYMENT_STATUSES[o.payment_status]}</span></td>
                <td className="px-3 py-2 whitespace-nowrap">{FULFILMENT_STATUSES[o.fulfilment_status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No orders found</p>}
      </div>

      <Dialog open={!!open} onOpenChange={v => !v && setOpenId(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <button onClick={() => copy(open.order_number)} className="font-mono text-xl text-primary flex items-center gap-2">
                    {open.order_number} <Copy className="w-4 h-4" />
                  </button>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Section n={1} title="Order Summary">
                  <Row label="Order date" value={when(open.created_at)} />
                  <div className="space-y-2 pt-1">
                    {open.order_items?.map((it: any) => (
                      <div key={it.id} className="flex items-center gap-3 rounded-lg bg-secondary/40 p-2">
                        <div className="w-12 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
                          {it.products?.image_url ? <img src={it.products.image_url} alt={it.product_name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 m-3.5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0 text-sm">
                          <p className="font-medium truncate">{it.product_name}</p>
                          <p className="text-xs text-muted-foreground">Qty {it.quantity}{it.selected_size ? ` · Size ${it.selected_size}` : ''}{it.selected_color ? ` · ${it.selected_color}` : ''}</p>
                        </div>
                        <span className="text-sm font-semibold">{money(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <Row label="Subtotal" value={money(open.subtotal_amount)} />
                  <Row label="Delivery fee" value={money(open.delivery_fee)} />
                  {Number(open.discount_amount) > 0 && <Row label="Discount" value={`-${money(open.discount_amount)}`} />}
                  <Row label="Total" value={<b>{money(open.total_amount)}</b>} />
                </Section>

                <Section n={2} title="Customer Information">
                  <Row label="Full name" value={open.customer_name} />
                  <Row label="Contact phone" value={open.customer_phone} />
                  <Row label="Alternative phone" value={open.alt_phone} />
                </Section>

                <Section n={3} title="Delivery Information">
                  <Row label="Method" value={open.delivery_method === 'delivery' ? 'Delivery' : 'Collection'} />
                  {open.delivery_method === 'delivery' && (open.delivery_city || open.delivery_area ? (
                    <>
                      <Row label="City" value={open.delivery_city} />
                      <Row label="Area / District" value={open.delivery_area} />
                      <Row label="How to find" value={<span className="whitespace-pre-line">{open.delivery_directions}</span>} />
                      <Row label="Instructions" value={open.delivery_instructions} />
                    </>
                  ) : <Row label="Address" value={open.delivery_address} />)}
                </Section>

                <Section n={4} title="Payment Information">
                  <Row label="Method" value={PAYMENT_METHOD_LABELS[open.payment_method] || open.payment_method} />
                  <Row label="Expected amount" value={<b>{money(open.total_amount)}</b>} />
                  <Row label="Transaction ref" value={open.payment_transaction_ref} />
                  <Row label="Date & time" value={open.payment_datetime} />
                  <Row label="Payer phone" value={open.payer_phone} />
                  <Row label="Customer note" value={open.order_notes} />
                  {dups.length > 0 && (
                    <p className="flex items-start gap-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      This reference is also used on: {dups.map(d => `${d.order_number} (${PAYMENT_STATUSES[d.payment_status as PaymentStatus]})`).join(', ')}
                    </p>
                  )}
                </Section>

                <Section n={5} title="Payment Verification">
                  <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Status:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payTone[open.payment_status]}`}>{PAYMENT_STATUSES[open.payment_status]}</span></div>
                  {open.payment_rejection_reason && open.payment_status === 'rejected' && <Row label="Rejection reason" value={open.payment_rejection_reason} />}
                  <div className="flex flex-wrap gap-2">
                    {open.payment_status !== 'paid' && open.payment_status !== 'refunded' && <Button size="sm" onClick={() => setPending({ type: 'payment', status: 'paid' })}>Mark as Paid</Button>}
                    {open.payment_status !== 'rejected' && open.payment_status !== 'refunded' && open.payment_status !== 'paid' && <Button size="sm" variant="destructive" onClick={() => setPending({ type: 'payment', status: 'rejected' })}>Reject</Button>}
                    {open.payment_status === 'paid' && <Button size="sm" variant="outline" onClick={() => setPending({ type: 'payment', status: 'refunded' })}>Mark as Refunded</Button>}
                    {open.payment_status === 'rejected' && <Button size="sm" variant="outline" onClick={() => setPending({ type: 'payment', status: 'verification_pending' })}>Re-open verification</Button>}
                  </div>
                  <HistoryList items={history.filter(h => h.status_type === 'payment')} />
                </Section>

                <Section n={6} title="Order Fulfilment">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <select className={selectCls} value={open.fulfilment_status}
                      onChange={e => setPending({ type: 'fulfilment', status: e.target.value })}>
                      {Object.entries(FULFILMENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <HistoryList items={history.filter(h => h.status_type === 'fulfilment')} />
                </Section>

                <Section n={7} title="Internal Admin Notes (staff only)">
                  <Textarea key={open.id} defaultValue={open.admin_notes || ''} rows={3} placeholder="Only staff can see these notes"
                    onBlur={async e => {
                      if ((open.admin_notes || '') === e.target.value) return;
                      const { error } = await supabase.from('orders').update({ admin_notes: e.target.value }).eq('id', open.id);
                      if (error) toast.error('Could not save note'); else { toast.success('Note saved'); load(); }
                    }} className="resize-none" />
                </Section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pending} onOpenChange={v => { if (!v) { setPending(null); setReason(''); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.dups ? 'Duplicate transaction reference' : `Change ${pending?.type === 'payment' ? 'payment' : 'order'} status to “${pending ? statusLabel(pending.type, pending.status) : ''}”?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.dups
                ? `This reference is already used on ${pending.dups.join(', ')}. Only continue if you have confirmed this is a separate, genuine payment.`
                : `Order ${open?.order_number}. This change is recorded with your account and the time.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!pending?.dups && (
            <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
              placeholder={pending?.status === 'rejected' ? 'Reason for rejection (required)' : 'Note (optional)'} />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={busy || (pending?.status === 'rejected' && !reason.trim())}
              onClick={e => { e.preventDefault(); if (pending?.dups) { setPending({ ...pending, dups: undefined, override: true }); } else apply(); }}>
              {pending?.dups ? 'Override and continue' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function HistoryList({ items }: { items: History[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-2 space-y-1 border-l-2 border-border pl-3">
      {items.map(h => (
        <li key={h.id} className="text-xs text-muted-foreground">
          <span className="text-foreground">{statusLabel(h.status_type, h.old_status)} → {statusLabel(h.status_type, h.new_status)}</span>
          {' · '}{when(h.changed_at)}{' · '}{h.changed_by_email || (h.changed_by_email === null && !h.old_status ? 'Customer' : 'Admin')}
          {h.reason && <span className="block">“{h.reason}”</span>}
        </li>
      ))}
    </ul>
  );
}
