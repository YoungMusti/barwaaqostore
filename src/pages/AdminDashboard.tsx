import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category, Order, OrderItem } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LogOut, Package, ShoppingCart, Grid, Plus, Loader2, Pencil, Trash2, Upload, Users, Key, Search, BarChart3, ChevronDown, ChevronUp, DollarSign, TrendingUp, Tag, Settings2, FileText, Flame, Download, AlertTriangle, MessageSquare } from 'lucide-react';
import { ProductVariantsManager } from '@/components/admin/ProductVariantsManager';
import { CatalogueManager } from '@/components/admin/CatalogueManager';
import { SaleBannerManager } from '@/components/admin/SaleBannerManager';
import { SalesCharts } from '@/components/admin/SalesCharts';

interface Catalogue {
  id: string;
  title: string;
  description: string | null;
  category: string;
  pdf_url: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories' | 'users' | 'analytics' | 'catalogues' | 'flash-sale'>('products');
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [variantsProduct, setVariantsProduct] = useState<Product | null>(null);
  const [showVariantsManager, setShowVariantsManager] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    is_on_sale: false,
    sale_price: ''
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
    const [p, c, o, cat] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
      supabase.from('catalogues').select('*').order('created_at', { ascending: false }),
    ]);
    if (p.data) setProducts(p.data as Product[]);
    if (c.data) setCategories(c.data as Category[]);
    if (o.data) setOrders(o.data as Order[]);
    if (cat.data) setCatalogues(cat.data as Catalogue[]);
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
        image_url: product.image_url || '',
        is_on_sale: product.is_on_sale || false,
        sale_price: product.sale_price?.toString() || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image_url: '',
        is_on_sale: false,
        sale_price: ''
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
      image_url: productForm.image_url || null,
      is_on_sale: productForm.is_on_sale,
      sale_price: productForm.is_on_sale && productForm.sale_price ? parseFloat(productForm.sale_price) : null
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

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (p.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || p.category_id === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, filterCategory]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalRevenue = orders
      .filter(o => o.status === 'paid' || o.status === 'completed')
      .reduce((sum, o) => sum + o.total_amount, 0);

    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'pending').length,
      paid: orders.filter(o => o.status === 'paid').length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    // Best selling products - count from order items
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders
      .filter(o => o.status === 'paid' || o.status === 'completed')
      .forEach(order => {
        order.order_items?.forEach(item => {
          if (!productSales[item.product_name]) {
            productSales[item.product_name] = { name: item.product_name, quantity: 0, revenue: 0 };
          }
          productSales[item.product_name].quantity += item.quantity;
          productSales[item.product_name].revenue += item.price * item.quantity;
        });
      });

    const bestSellers = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return { totalRevenue, ordersByStatus, bestSellers };
  }, [orders]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="font-display text-xl font-bold">BARWAAGO Admin</h1>
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
            { key: 'analytics', icon: BarChart3, label: 'Analytics' },
            { key: 'products', icon: Package, label: 'Products' },
            { key: 'orders', icon: ShoppingCart, label: 'Orders' },
            { key: 'categories', icon: Grid, label: 'Categories' },
            { key: 'catalogues', icon: FileText, label: 'Catalogues' },
            { key: 'flash-sale', icon: Flame, label: 'Flash Sale' },
            { key: 'users', icon: Users, label: 'Admin Users' },
          ].map(tab => (
            <Button key={tab.key} variant={activeTab === tab.key ? 'default' : 'outline'} onClick={() => setActiveTab(tab.key as any)} className="gap-2">
              <tab.icon className="w-4 h-4" />{tab.label}
            </Button>
          ))}
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Orders</p>
                    <p className="text-2xl font-bold">{analytics.ordersByStatus.completed}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <Package className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                    <p className="text-2xl font-bold">{analytics.ordersByStatus.pending}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl border p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary rounded-lg">
                    <TrendingUp className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{orders.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders by Status */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-secondary/50 rounded-lg">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Sellers */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="text-lg font-semibold mb-4">Best Selling Products</h3>
              {analytics.bestSellers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No sales data yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.bestSellers.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.quantity} sold</p>
                        <p className="text-sm text-muted-foreground">${item.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Charts */}
            <SalesCharts orders={orders} />

            {/* Low Stock Alerts */}
            {(() => {
              const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
              if (lowStockProducts.length === 0) return null;
              return (
                <div className="bg-card rounded-xl border border-warning/30 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Low Stock Alerts ({lowStockProducts.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lowStockProducts.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          {p.image_url && <img src={p.image_url} className="w-8 h-8 rounded object-cover" />}
                          <span className="font-medium text-sm">{p.name}</span>
                        </div>
                        <span className="text-warning font-bold text-sm">{p.stock} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-card rounded-xl border p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Products ({filteredProducts.length})</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const csvRows = ['Name,Price,Sale Price,Stock,Category,On Sale'];
                    products.forEach(p => {
                      const cat = categories.find(c => c.id === p.category_id);
                      csvRows.push(`"${p.name}",${p.price},${p.sale_price || ''},${p.stock},"${cat?.name || ''}",${p.is_on_sale}`);
                    });
                    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `products-${new Date().toISOString().slice(0,10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success('Products exported!');
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 w-full md:w-64"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={productDialog} onOpenChange={setProductDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openProductDialog()} className="gap-2"><Plus className="w-4 h-4" />Add</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                      {/* Sale Section */}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            On Sale
                          </Label>
                          <Switch 
                            checked={productForm.is_on_sale} 
                            onCheckedChange={v => setProductForm({ ...productForm, is_on_sale: v })} 
                          />
                        </div>
                        {productForm.is_on_sale && (
                          <div>
                            <Label>Sale Price (USD)</Label>
                            <Input 
                              type="number" 
                              step="0.01" 
                              value={productForm.sale_price} 
                              onChange={e => setProductForm({ ...productForm, sale_price: e.target.value })} 
                              placeholder="Discounted price"
                            />
                          </div>
                        )}
                      </div>
                      <Button onClick={saveProduct} className="w-full">{editingProduct ? 'Update' : 'Create'} Product</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="divide-y">
              {filteredProducts.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} className="w-12 h-12 rounded-lg object-cover" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{p.name}</p>
                        {p.is_on_sale && (
                          <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">Sale</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {p.is_on_sale && p.sale_price ? (
                          <>
                            <span className="text-destructive font-medium">${p.sale_price}</span>
                            <span className="line-through ml-1">${p.price}</span>
                          </>
                        ) : (
                          `$${p.price}`
                        )}
                        {' · '}{p.stock} in stock
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setVariantsProduct(p); setShowVariantsManager(true); }} title="Manage sizes, colors, images">
                      <Settings2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openProductDialog(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteProduct(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No products found</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-card rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Orders ({orders.length})</h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  const csvRows = ['Phone,Amount,Status,Payment Method,Reference,Date,Notes'];
                  orders.forEach(o => {
                    csvRows.push(`"${o.customer_phone}",${o.total_amount},"${o.status}","${o.payment_method}","${o.payment_reference || ''}","${new Date(o.created_at).toLocaleDateString()}","${(o as any).admin_notes || ''}"`);
                  });
                  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Orders exported!');
                }}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
            <div className="divide-y">
              {orders.map(o => (
                <div key={o.id} className="py-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{o.customer_phone}</p>
                        <button 
                          onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {expandedOrder === o.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground">Ref: {o.payment_reference || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                    </div>
                    <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value as Order['status'])} className="border rounded-lg px-3 py-1 text-sm">
                      {['pending', 'paid', 'processing', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  
                  {/* Order Items */}
                  {expandedOrder === o.id && o.order_items && o.order_items.length > 0 && (
                    <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Order Items:</p>
                      <div className="space-y-2">
                        {o.order_items.map((item: OrderItem) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product_name} × {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Order Notes */}
                  {expandedOrder === o.id && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Admin Notes</span>
                      </div>
                      <Textarea
                        placeholder="Add internal notes about this order..."
                        defaultValue={(o as any).admin_notes || ''}
                        className="text-sm h-16"
                        onBlur={async (e) => {
                          const notes = e.target.value;
                          await supabase.from('orders').update({ admin_notes: notes } as any).eq('id', o.id);
                          toast.success('Note saved');
                        }}
                      />
                    </div>
                  )}
                  
                  <p className="font-semibold mt-2">${o.total_amount}</p>
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
              <Button onClick={createAdminUser} disabled={creatingAdmin} className="w-full">
                {creatingAdmin ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Admin
              </Button>
            </div>
          </div>
        )}

        {/* Catalogues Tab */}
        {activeTab === 'catalogues' && (
          <CatalogueManager catalogues={catalogues} onRefresh={fetchData} />
        )}

        {/* Flash Sale Tab */}
        {activeTab === 'flash-sale' && (
          <SaleBannerManager />
        )}
      </div>
      
      {/* Variants Manager Modal */}
      {variantsProduct && (
        <ProductVariantsManager
          product={variantsProduct}
          open={showVariantsManager}
          onOpenChange={setShowVariantsManager}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}