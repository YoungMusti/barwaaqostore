import type { Category } from '@/types/database';

export const departments = [
  { key: 'men', path: '/mens-shoes', name: "Men’s Shoes", nameSo: 'Kabaha Ragga' },
  { key: 'women', path: '/womens-shoes', name: "Women’s Shoes", nameSo: 'Kabaha Dumarka' },
  { key: 'cosmetics', path: '/cosmetics', name: 'Cosmetics', nameSo: 'Qurxinta' },
] as const;

export type DepartmentKey = typeof departments[number]['key'];

export const storePages = [{ key: 'home', path: '/', name: 'Home', nameSo: 'Guriga' }, ...departments] as const;

export function visibleCategories(categories: Category[], department?: DepartmentKey) {
  return categories.filter(category => category.enabled && (!department || matchesDepartment(category, department)));
}

export function matchesDepartment(category: Pick<Category, 'name'>, department: DepartmentKey) {
  const name = category.name.toLowerCase().replace(/[’']/g, '').trim();
  if (department === 'women') return /^(women|womens|womens shoes|women shoes|ladies|ladies shoes)$/.test(name);
  if (department === 'men') return /^(men|mens|mens shoes|men shoes)$/.test(name);
  return /^(cosmetics|cosmetic|cosmatics|beauty|makeup|skin care|skincare)$/.test(name);
}