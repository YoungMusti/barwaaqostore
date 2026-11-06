import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useStorefrontSettings() {
  const [showNewArrivals, setShowNewArrivals] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const channelName = useRef(`storefront-settings-${Math.random().toString(36).slice(2)}`);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from('storefront_settings')
      .select('show_new_arrivals')
      .eq('id', 1)
      .maybeSingle();

    if (data) setShowNewArrivals(data.show_new_arrivals);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchSettings();
    const channel = supabase
      .channel(channelName.current)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'storefront_settings' }, fetchSettings)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  const setNewArrivalsVisible = useCallback(async (visible: boolean) => {
    const { error } = await supabase
      .from('storefront_settings')
      .update({ show_new_arrivals: visible })
      .eq('id', 1);

    if (!error) setShowNewArrivals(visible);
    return { error };
  }, []);

  return { showNewArrivals, isLoading, setNewArrivalsVisible };
}
