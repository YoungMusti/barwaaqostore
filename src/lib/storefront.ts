export function shouldShowNewArrivals(itemCount: number, enabled = true): boolean {
  return enabled && itemCount > 0;
}
