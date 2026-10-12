export const DELIVERY_FEE = 2;
export const PHONE_REGEX = /^\+252[0-9]{8,9}$/;

export const PAYMENT_STATUSES = {
  awaiting_payment: 'Awaiting Payment',
  verification_pending: 'Verification Pending',
  paid: 'Paid',
  rejected: 'Rejected',
  refunded: 'Refunded',
} as const;

export const FULFILMENT_STATUSES = {
  new: 'New Order',
  processing: 'Processing',
  ready_for_dispatch: 'Ready for Dispatch',
  out_for_delivery: 'Out for Delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export type PaymentStatus = keyof typeof PAYMENT_STATUSES;
export type FulfilmentStatus = keyof typeof FULFILMENT_STATUSES;

export const PAYMENT_METHOD_LABELS: Record<string, string> = { EVC: 'EVC Plus', SALAAM: 'Salaam Bank' };

/** Mirrors the database's numbering (BARWAAQO01 … BARWAAQO99, BARWAAQO100 …). Display/test helper only. */
export function formatOrderNumber(n: number) {
  return 'BARWAAQO' + (n < 10 ? '0' + n : String(n));
}

export function orderCost(subtotal: number, deliveryMethod: 'collection' | 'delivery', discount = 0) {
  const delivery = deliveryMethod === 'delivery' ? DELIVERY_FEE : 0;
  return { subtotal, delivery, discount, total: Math.max(0, subtotal + delivery - discount) };
}

export interface CheckoutDetails {
  fullName: string;
  phone: string;
  deliveryMethod: 'collection' | 'delivery';
  city: string;
  area: string;
  directions: string;
  altPhone: string;
}

export function validateCheckoutDetails(d: CheckoutDetails) {
  const e: Record<string, string> = {};
  if (!d.fullName.trim()) e.fullName = 'Full name is required';
  if (!d.phone.trim() || d.phone.trim() === '+252') e.phone = 'Contact phone number is required';
  else if (!PHONE_REGEX.test(d.phone.trim())) e.phone = 'Use +252 followed by 8-9 digits';
  const alt = d.altPhone.trim();
  if (alt && alt !== '+252' && !PHONE_REGEX.test(alt)) e.altPhone = 'Use +252 followed by 8-9 digits';
  if (d.deliveryMethod === 'delivery') {
    if (!d.city.trim()) e.city = 'City is required';
    if (!d.area.trim()) e.area = 'Area / district is required';
    if (!d.directions.trim()) e.directions = 'Please explain how to find your location';
  }
  return e;
}

/** Digits only, so "+252 61 234", "0612 34" and "252612 34" compare sensibly. */
export function normalizeDigits(value: string) {
  return value.replace(/\D/g, '').replace(/^252/, '').replace(/^0+/, '');
}

export interface SearchableOrder {
  order_number?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  alt_phone?: string | null;
  payer_phone?: string | null;
  payment_transaction_ref?: string | null;
}

export function orderMatchesSearch(o: SearchableOrder, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const compact = q.replace(/\s+/g, '');
  const text = [o.order_number, o.customer_name, o.payment_transaction_ref]
    .some(v => v && (v.toLowerCase().includes(q) || v.toLowerCase().replace(/\s+/g, '').includes(compact)));
  if (text) return true;
  const digits = normalizeDigits(q);
  if (digits.length < 3) return false;
  return [o.customer_phone, o.alt_phone, o.payer_phone].some(p => p && normalizeDigits(p).includes(digits));
}

/** Other orders sharing the same (whitespace/case-insensitive) transaction reference. */
export function duplicateReferenceOrders<T extends SearchableOrder & { id: string; payment_status?: string }>(order: T, all: T[]) {
  const ref = order.payment_transaction_ref?.replace(/\s/g, '').toLowerCase();
  if (!ref) return [];
  return all.filter(o => o.id !== order.id && o.payment_transaction_ref?.replace(/\s/g, '').toLowerCase() === ref);
}
