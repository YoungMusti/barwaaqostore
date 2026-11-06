import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useStorefrontSettings } from '@/hooks/useStorefrontSettings';

export function StorefrontSettings() {
  const { showNewArrivals, isLoading, setNewArrivalsVisible } = useStorefrontSettings();
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (visible: boolean) => {
    setIsSaving(true);
    const { error } = await setNewArrivalsVisible(visible);
    setIsSaving(false);

    if (error) {
      toast.error('Could not update the storefront. Please try again.');
      return;
    }
    toast.success(`Fresh Arrivals is now ${visible ? 'visible' : 'hidden'}`);
  };

  return (
    <div className="max-w-2xl rounded-xl border bg-card p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Storefront sections</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose which sections customers see on the shop pages.</p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border bg-secondary/40 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <label htmlFor="show-new-arrivals" className="font-medium">Fresh Arrivals</label>
            <p className="mt-0.5 text-sm text-muted-foreground">Show the latest-product showcase on Home and department pages.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading || isSaving ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
          <Switch
            id="show-new-arrivals"
            checked={showNewArrivals}
            onCheckedChange={handleToggle}
            disabled={isLoading || isSaving}
          />
        </div>
      </div>
    </div>
  );
}
