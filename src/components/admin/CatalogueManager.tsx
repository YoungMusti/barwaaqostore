import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Upload, FileText, Eye, Loader2 } from 'lucide-react';

interface Catalogue {
  id: string;
  title: string;
  description: string | null;
  category: string;
  pdf_url: string;
  created_at: string;
}

const CATEGORIES = [
  { id: 'men', label: "Men's Shoes" },
  { id: 'women', label: "Women's Shoes" },
  { id: 'kids', label: "Kids' Shoes" },
  { id: 'sports', label: "Sports Shoes" },
  { id: 'football', label: "Football Kits" },
];

interface CatalogueManagerProps {
  catalogues: Catalogue[];
  onRefresh: () => void;
}

export function CatalogueManager({ catalogues, onRefresh }: CatalogueManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Catalogue | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    pdf_url: ''
  });

  function openDialog(catalogue?: Catalogue) {
    if (catalogue) {
      setEditing(catalogue);
      setForm({
        title: catalogue.title,
        description: catalogue.description || '',
        category: catalogue.category,
        pdf_url: catalogue.pdf_url
      });
    } else {
      setEditing(null);
      setForm({ title: '', description: '', category: '', pdf_url: '' });
    }
    setDialogOpen(true);
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const { error: uploadError } = await supabase.storage
      .from('catalogues')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Failed to upload PDF: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('catalogues')
      .getPublicUrl(fileName);

    setForm({ ...form, pdf_url: publicUrl });
    setUploading(false);
    toast.success('PDF uploaded');
  }

  async function saveCatalogue() {
    if (!form.title || !form.category || !form.pdf_url) {
      toast.error('Title, category, and PDF are required');
      return;
    }

    setSaving(true);

    const catalogueData = {
      title: form.title,
      description: form.description || null,
      category: form.category,
      pdf_url: form.pdf_url
    };

    if (editing) {
      const { error } = await supabase
        .from('catalogues')
        .update(catalogueData)
        .eq('id', editing.id);

      if (error) {
        toast.error('Failed to update catalogue');
        setSaving(false);
        return;
      }
      toast.success('Catalogue updated');
    } else {
      const { error } = await supabase
        .from('catalogues')
        .insert(catalogueData);

      if (error) {
        toast.error('Failed to create catalogue');
        setSaving(false);
        return;
      }
      toast.success('Catalogue created');
    }

    setSaving(false);
    setDialogOpen(false);
    onRefresh();
  }

  async function deleteCatalogue(id: string) {
    if (!confirm('Are you sure you want to delete this catalogue?')) return;

    const { error } = await supabase.from('catalogues').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete catalogue');
      return;
    }
    toast.success('Catalogue deleted');
    onRefresh();
  }

  const getCategoryLabel = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId)?.label || catId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Catalogues</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Catalogue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Catalogue' : 'Add New Catalogue'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Catalogue title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description"
                  rows={2}
                />
              </div>

              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={val => setForm({ ...form, category: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>PDF File *</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 gap-2"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Upload PDF'}
                  </Button>
                  {form.pdf_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(form.pdf_url, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {form.pdf_url && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {form.pdf_url.split('/').pop()}
                  </p>
                )}
              </div>

              <Button 
                onClick={saveCatalogue} 
                disabled={saving || uploading}
                className="w-full"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editing ? 'Update Catalogue' : 'Create Catalogue'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Catalogues List */}
      {catalogues.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No catalogues yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {catalogues.map(catalogue => (
            <div 
              key={catalogue.id} 
              className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-primary/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{catalogue.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                    {getCategoryLabel(catalogue.category)}
                  </span>
                  {catalogue.description && (
                    <span className="truncate">{catalogue.description}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(catalogue.pdf_url, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openDialog(catalogue)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteCatalogue(catalogue.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
