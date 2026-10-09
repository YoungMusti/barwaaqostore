import { describe, test, expect } from 'bun:test';
import { matchesDepartment, departments, storePages, visibleCategories } from './departments';

describe('three department storefronts', () => {
  test('men shoes cannot include women shoes', () => {
    expect(matchesDepartment({ name: 'Men' }, 'men')).toBe(true);
    expect(matchesDepartment({ name: "Women's Shoes" }, 'men')).toBe(false);
  });
  test('women shoes cannot include men shoes', () => {
    expect(matchesDepartment({ name: 'Women' }, 'women')).toBe(true);
    expect(matchesDepartment({ name: 'Men' }, 'women')).toBe(false);
  });
  test('cosmetics are separate from shoes', () => {
    expect(matchesDepartment({ name: 'Cosmetics' }, 'cosmetics')).toBe(true);
    expect(matchesDepartment({ name: 'Women' }, 'cosmetics')).toBe(false);
  });
  test('exactly three distinct pages are configured', () => {
    expect(departments.length).toBe(3);
    expect(new Set(departments.map(d => d.path)).size).toBe(3);
  });
  test('home combines all enabled collections', () => {
    const categories = ['Men', 'Women', 'Cosmetics', 'Boys'].map((name, i) => ({ id: String(i), name, name_somali: name, created_at: '', enabled: name !== 'Boys' }));
    expect(visibleCategories(categories).map(c => c.name)).toEqual(['Men', 'Women', 'Cosmetics']);
    expect(visibleCategories(categories, 'women').map(c => c.name)).toEqual(['Women']);
    expect(storePages.map(p => p.path)).toEqual(['/', '/mens-shoes', '/womens-shoes', '/cosmetics']);
  });
});