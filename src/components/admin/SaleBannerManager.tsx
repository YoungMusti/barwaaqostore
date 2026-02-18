import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Flame, Loader2, Save } from 'lucide-react';

interface SaleBanner {
  id: string;
  title: string;
  title_somali: string;
  discount_text: string;
  discount_text_somali: string;
  is_active: boolean;
  end_time: string;
}

export function SaleBannerManager() {
  const [banner, setBanner] = useState<SaleBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBanner();
  }, []);

  async function fetchBanner() {
    const { data } = await supabase
      .from('sale_banners')
      .select('*')
      .limit(1)
      .single();
    if (data) setBanner(data as SaleBanner);
    setLoading(false);
  }

  async function saveBanner() {
    if (!banner) return;
    setSaving(true);
    const { error } = await supabase
      .from('sale_banners')
      .update({
        title: banner.title,
        title_somali: banner.title_somali,
        discount_text: banner.discount_text,
        discount_text_somali: banner.discount_text_somali,
        is_active: banner.is_active,
        end_time: banner.end_time,
      })
      .eq('id', banner.id);

    if (error) {
      toast.error('Failed to save banner settings');
    } else {
      toast.success('Flash Sale banner updated!');
    }
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!banner) return <p className="text-muted-foreground p-4">No banner configured</p>;

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-destructive/10 rounded-lg">
          <Flame className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Flash Sale Banner</h2>
          <p className="text-sm text-muted-foreground">Configure the countdown banner on the storefront</p>
        </div>
      </div>

      <div className="space-y-5 max-w-xl">
        {/* Active Toggle */}
        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
          <div>
            <p className="font-medium">Banner Active</p>
            <p className="text-sm text-muted-foreground">Show/hide the flash sale banner</p>
          </div>
          <Switch
            checked={banner.is_active}
            onCheckedChange={v => setBanner({ ...banner, is_active: v })}
          />
        </div>

        {/* Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Title (English)</Label>
            <Input
              value={banner.title}
              onChange={e => setBanner({ ...banner, title: e.target.value })}
              placeholder="Flash Sale!"
            />
          </div>
          <div>
            <Label>Title (Somali)</Label>
            <Input
              value={banner.title_somali}
              onChange={e => setBanner({ ...banner, title_somali: e.target.value })}
              placeholder="Qiimo Gaar ah!"
            />
          </div>
        </div>

        {/* Discount Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Discount Text (English)</Label>
            <Input
              value={banner.discount_text}
              onChange={e => setBanner({ ...banner, discount_text: e.target.value })}
              placeholder="Up to 50% off!"
            />
          </div>
          <div>
            <Label>Discount Text (Somali)</Label>
            <Input
              value={banner.discount_text_somali}
              onChange={e => setBanner({ ...banner, discount_text_somali: e.target.value })}
              placeholder="ilaa 50% dhimis!"
            />
          </div>
        </div>

        {/* End Time */}
        <div>
          <Label>Sale End Time</Label>
          <Input
            type="datetime-local"
            value={banner.end_time ? new Date(banner.end_time).toISOString().slice(0, 16) : ''}
            onChange={e => setBanner({ ...banner, end_time: new Date(e.target.value).toISOString() })}
          />
          <p className="text-xs text-muted-foreground mt-1">The countdown timer will count down to this time</p>
        </div>

        <Button onClick={saveBanner} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Banner Settings
        </Button>
      </div>
    </div>
  );
}
