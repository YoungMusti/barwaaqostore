import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, Order } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { LogOut, Package, ShoppingCart, Grid, Plus, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories'>('products');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin');
      return;
    }
    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    if (!roleData) {
      await supabase.auth.signOut();
      navigate('/admin');
    }
  }

  async function fetchData() {
    const [p, c, o] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
    ]);
    if (p.data) setProducts(p.data as Product[]);
    if (c.data) setCategories(c.data as Category[]);
    if (o.data) setOrders(o.data as Order[]);
    setIsLoading(false);
  }

  async function toggleCategory(id: string, enabled: boolean) {
    await supabase.from('categories').update({ enabled }).eq('id', id);
    setCategories(categories.map(c => c.id === id ? { ...c, enabled } : c));
    toast.success('Category updated');
  }

  async function updateOrderStatus(id: string, status: Order['status']) {
    await supabase.from('orders').update({ status }).eq('id', id);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    toast.success('Order status updated');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin');
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="font-display text-xl font-bold">SOLE Admin</h1>
          <div className="flex items-center gap-4">
            <Link to="/"><Button variant="ghost" size="sm">View Store</Button></Link>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex gap-2 mb-6">
          {[
            { key: 'products', icon: Package, label: 'Products' },
            { key: 'orders', icon: ShoppingCart, label: 'Orders' },
            { key: 'categories', icon: Grid, label: 'Categories' },
          ].map(tab => (
            <Button key={tab.key} variant={activeTab === tab.key ? 'default' : 'outline'} onClick={() => setActiveTab(tab.key as any)} className="gap-2">
              <tab.icon className="w-4 h-4" />{tab.label}
            </Button>
          ))}
        </div>

        {activeTab === 'products' && (
          <div className="bg-card rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Products ({products.length})</h2>
            </div>
            <div className="divide-y">
              {products.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} className="w-10 h-10 rounded-lg object-cover" />}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">${p.price} · {p.stock} in stock</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Orders ({orders.length})</h2>
            <div className="divide-y">
              {orders.map(o => (
                <div key={o.id} className="py-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{o.customer_phone}</p>
                      <p className="text-sm text-muted-foreground">Ref: {o.payment_reference || 'N/A'}</p>
                    </div>
                    <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} className="border rounded-lg px-3 py-1 text-sm">
                      {['pending', 'paid', 'processing', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <p className="font-semibold">${o.total_amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="space-y-3">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.name_somali}</p>
                  </div>
                  <Switch checked={c.enabled} onCheckedChange={v => toggleCategory(c.id, v)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
