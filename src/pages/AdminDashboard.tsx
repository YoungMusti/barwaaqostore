import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, Order } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LogOut, Package, ShoppingCart, Grid, Plus, Loader2, Pencil, Trash2, Upload, Users, Key } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories' | 'users'>('products');
  const [isLoading, setIsLoading] = useState(true);
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: ''
  });

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
    toast.success(status === 'paid' ? 'Order marked as paid - stock reduced!' : 'Order status updated');
    if (status === 'paid') {
      fetchData();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin');
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Failed to upload image');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    setProductForm({ ...productForm, image_url: publicUrl });
    setUploading(false);
    toast.success('Image uploaded');
  }

  function openProductDialog(product?: Product) {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        category_id: product.category_id || '',
        image_url: product.image_url || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image_url: ''
      });
    }
    setProductDialog(true);
  }

  async function saveProduct() {
    if (!productForm.name || !productForm.price) {
      toast.error('Name and price are required');
      return;
    }

    const productData = {
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock) || 0,
      category_id: productForm.category_id || null,
      image_url: productForm.image_url || null
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
      if (error) {
        toast.error('Failed to update product');
        return;
      }
      toast.success('Product updated');
    } else {
      const { error } = await supabase.from('products').insert(productData);
      if (error) {
        toast.error('Failed to create product');
        return;
      }
      toast.success('Product created');
    }

    setProductDialog(false);
    fetchData();
  }

  async function deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete product');
      return;
    }
    toast.success('Product deleted');
    fetchData();
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error('Failed to change password');
      return;
    }
    toast.success('Password changed successfully');
    setPasswordDialog(false);
    setNewPassword('');
    setConfirmPassword('');
  }

  async function createAdminUser() {
    if (!newAdminEmail || !newAdminPassword) {
      toast.error('Email and password are required');
      return;
    }
    if (newAdminPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setCreatingAdmin(true);
    
    // Sign up the new admin
    const { data, error } = await supabase.auth.signUp({
      email: newAdminEmail,
      password: newAdminPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/dashboard`
      }
    });

    if (error) {
      toast.error(error.message);
      setCreatingAdmin(false);
      return;
    }

    if (data.user) {
      // Assign admin role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: 'admin'
      });

      if (roleError) {
        toast.error('User created but failed to assign admin role');
      } else {
        toast.success('Admin user created successfully');
      }
    }

    setNewAdminEmail('');
    setNewAdminPassword('');
    setCreatingAdmin(false);
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="font-display text-xl font-bold">SOLE Admin</h1>
          <div className="flex items-center gap-2">
            <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm"><Key className="w-4 h-4 mr-2" />Password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label>New Password</Label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                  <Button onClick={changePassword} className="w-full">Update Password</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Link to="/"><Button variant="ghost" size="sm">View Store</Button></Link>
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Logout</Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'products', icon: Package, label: 'Products' },
            { key: 'orders', icon: ShoppingCart, label: 'Orders' },
            { key: 'categories', icon: Grid, label: 'Categories' },
            { key: 'users', icon: Users, label: 'Admin Users' },
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
              <Dialog open={productDialog} onOpenChange={setProductDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => openProductDialog()} className="gap-2"><Plus className="w-4 h-4" />Add Product</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label>Name *</Label>
                      <Input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price (USD) *</Label>
                        <Input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                      </div>
                      <div>
                        <Label>Stock</Label>
                        <Input type="number" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={productForm.category_id} onValueChange={v => setProductForm({ ...productForm, category_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Image</Label>
                      <div className="flex gap-2 items-center">
                        <Input 
                          value={productForm.image_url} 
                          onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} 
                          placeholder="Image URL or upload"
                        />
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        </Button>
                      </div>
                      {productForm.image_url && (
                        <img src={productForm.image_url} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
                      )}
                    </div>
                    <Button onClick={saveProduct} className="w-full">{editingProduct ? 'Update' : 'Create'} Product</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="divide-y">
              {products.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover" />}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">${p.price} · {p.stock} in stock</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openProductDialog(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteProduct(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value as Order['status'])} className="border rounded-lg px-3 py-1 text-sm">
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

        {activeTab === 'users' && (
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">Create Admin User</h2>
            <div className="max-w-md space-y-4">
              <div>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={newAdminEmail} 
                  onChange={e => setNewAdminEmail(e.target.value)} 
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input 
                  type="password" 
                  value={newAdminPassword} 
                  onChange={e => setNewAdminPassword(e.target.value)} 
                  placeholder="Min 6 characters"
                />
              </div>
              <Button onClick={createAdminUser} disabled={creatingAdmin} className="gap-2">
                {creatingAdmin && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Admin
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
