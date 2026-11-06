import { describe, expect, it } from 'bun:test';
import { shouldShowNewArrivals } from './storefront';

describe('Fresh Arrivals visibility', () => {
  it('hides Fresh Arrivals when the admin switches it off', () => {
    expect(shouldShowNewArrivals(8, false)).toBe(false);
  });

  it('shows Fresh Arrivals when enabled and products are available', () => {
    expect(shouldShowNewArrivals(8, true)).toBe(true);
  });

  it('stays hidden when there are no products to show', () => {
    expect(shouldShowNewArrivals(0, true)).toBe(false);
  });
});
