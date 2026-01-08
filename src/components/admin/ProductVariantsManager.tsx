import { useState, useEffect, useRef } from 'react';
import { Product, ProductImage, ProductColor, ProductSize } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Loader2, Image, Palette, Ruler } from 'lucide-react';

interface ProductVariantsManagerProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ProductVariantsManager({ product, open, onOpenChange, onUpdate }: ProductVariantsManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'images' | 'colors' | 'sizes'>('images');
  
  // New item forms
  const [newColor, setNewColor] = useState({ name: '', hex_code: '#000000' });
  const [newSize, setNewSize] = useState({ eu_size: '', us_size: '', stock: '0' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && product) {
      fetchVariants();
    }
  }, [open, product]);

  async function fetchVariants() {
    setIsLoading(true);
    const [imagesRes, colorsRes, sizesRes] = await Promise.all([
      supabase.from('product_images').select('*').eq('product_id', product.id).order('display_order'),
      supabase.from('product_colors').select('*').eq('product_id', product.id),
      supabase.from('product_sizes').select('*').eq('product_id', product.id).order('eu_size'),
    ]);
    setImages(imagesRes.data || []);
    setColors(colorsRes.data || []);
    setSizes(sizesRes.data || []);
    setIsLoading(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${product.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
    if (uploadError) {
      toast.error('Failed to upload image');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
    
    const { error } = await supabase.from('product_images').insert({
      product_id: product.id,
      image_url: publicUrl,
      display_order: images.length
    });

    if (error) {
      toast.error('Failed to save image');
    } else {
      toast.success('Image added');
      fetchVariants();
      onUpdate();
    }
    setUploading(false);
  }

  async function deleteImage(id: string) {
    const { error } = await supabase.from('product_images').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete image');
    } else {
      toast.success('Image deleted');
      fetchVariants();
      onUpdate();
    }
  }

  async function addColor() {
    if (!newColor.name) {
      toast.error('Color name is required');
      return;
    }
    
    const { error } = await supabase.from('product_colors').insert({
      product_id: product.id,
      name: newColor.name,
      hex_code: newColor.hex_code
    });

    if (error) {
      toast.error('Failed to add color');
    } else {
      toast.success('Color added');
      setNewColor({ name: '', hex_code: '#000000' });
      fetchVariants();
      onUpdate();
    }
  }

  async function deleteColor(id: string) {
    const { error } = await supabase.from('product_colors').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete color');
    } else {
      toast.success('Color deleted');
      fetchVariants();
      onUpdate();
    }
  }

  async function addSize() {
    if (!newSize.eu_size || !newSize.us_size) {
      toast.error('Both EU and US sizes are required');
      return;
    }
    
    const { error } = await supabase.from('product_sizes').insert({
      product_id: product.id,
      eu_size: newSize.eu_size,
      us_size: newSize.us_size,
      stock: parseInt(newSize.stock) || 0
    });

    if (error) {
      toast.error('Failed to add size');
    } else {
      toast.success('Size added');
      setNewSize({ eu_size: '', us_size: '', stock: '0' });
      fetchVariants();
      onUpdate();
    }
  }

  async function updateSizeStock(id: string, stock: number) {
    const { error } = await supabase.from('product_sizes').update({ stock }).eq('id', id);
    if (error) {
      toast.error('Failed to update stock');
    } else {
      setSizes(sizes.map(s => s.id === id ? { ...s, stock } : s));
    }
  }

  async function deleteSize(id: string) {
    const { error } = await supabase.from('product_sizes').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete size');
    } else {
      toast.success('Size deleted');
      fetchVariants();
      onUpdate();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Variants: {product.name}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b pb-2">
              {[
                { key: 'images', icon: Image, label: `Images (${images.length})` },
                { key: 'colors', icon: Palette, label: `Colors (${colors.length})` },
                { key: 'sizes', icon: Ruler, label: `Sizes (${sizes.length})` },
              ].map(tab => (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab.key as any)}
                  className="gap-2"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {images.map(img => (
                    <div key={img.id} className="relative group">
                      <img src={img.image_url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                      <button
                        onClick={() => deleteImage(img.id)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="outline" className="w-full gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Add Image
                </Button>
              </div>
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {colors.map(color => (
                    <div key={color.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: color.hex_code }} />
                        <span>{color.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteColor(color.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Color Name</Label>
                    <Input 
                      placeholder="e.g. Black, White, Red" 
                      value={newColor.name} 
                      onChange={e => setNewColor({ ...newColor, name: e.target.value })} 
                    />
                  </div>
                  <div className="w-20">
                    <Label>Color</Label>
                    <Input 
                      type="color" 
                      value={newColor.hex_code} 
                      onChange={e => setNewColor({ ...newColor, hex_code: e.target.value })} 
                      className="h-10 p-1"
                    />
                  </div>
                  <Button onClick={addColor}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            )}

            {/* Sizes Tab */}
            {activeTab === 'sizes' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  {sizes.map(size => (
                    <div key={size.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                      <span className="font-medium">EU {size.eu_size} / US {size.us_size}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={size.stock}
                          onChange={e => updateSizeStock(size.id, parseInt(e.target.value) || 0)}
                          className="w-20 h-8 text-center"
                        />
                        <span className="text-sm text-muted-foreground">stock</span>
                        <Button variant="ghost" size="sm" onClick={() => deleteSize(size.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>EU Size</Label>
                    <Input 
                      placeholder="e.g. 42" 
                      value={newSize.eu_size} 
                      onChange={e => setNewSize({ ...newSize, eu_size: e.target.value })} 
                    />
                  </div>
                  <div className="flex-1">
                    <Label>US Size</Label>
                    <Input 
                      placeholder="e.g. 9" 
                      value={newSize.us_size} 
                      onChange={e => setNewSize({ ...newSize, us_size: e.target.value })} 
                    />
                  </div>
                  <div className="w-24">
                    <Label>Stock</Label>
                    <Input 
                      type="number" 
                      min="0"
                      value={newSize.stock} 
                      onChange={e => setNewSize({ ...newSize, stock: e.target.value })} 
                    />
                  </div>
                  <Button onClick={addSize}><Plus className="w-4 h-4" /></Button>
                </div>
                
                {/* Common sizes quick add */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Quick add common sizes:</p>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { eu: '36', us: '4' }, { eu: '37', us: '5' }, { eu: '38', us: '6' },
                      { eu: '39', us: '7' }, { eu: '40', us: '7.5' }, { eu: '41', us: '8' },
                      { eu: '42', us: '9' }, { eu: '43', us: '10' }, { eu: '44', us: '11' },
                      { eu: '45', us: '12' }, { eu: '46', us: '13' }
                    ].map(s => (
                      <Button
                        key={s.eu}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        disabled={sizes.some(sz => sz.eu_size === s.eu)}
                        onClick={() => setNewSize({ eu_size: s.eu, us_size: s.us, stock: '10' })}
                      >
                        EU{s.eu}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}