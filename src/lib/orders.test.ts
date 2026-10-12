import { describe, test, expect } from 'bun:test';
import { formatOrderNumber, orderCost, validateCheckoutDetails, orderMatchesSearch, duplicateReferenceOrders } from './orders';

const base = { fullName: 'Amina', phone: '+252612345678', deliveryMethod: 'delivery' as const, city: '', area: '', directions: '', altPhone: '' };

describe('order numbers', () => {
  test('first order is BARWAAQO01', () => expect(formatOrderNumber(1)).toBe('BARWAAQO01'));
  test('after BARWAAQO99 comes BARWAAQO100', () => {
    expect(formatOrderNumber(99)).toBe('BARWAAQO99');
    expect(formatOrderNumber(100)).toBe('BARWAAQO100');
  });
});

describe('order cost', () => {
  test('delivery adds $2', () => expect(orderCost(12, 'delivery').total).toBe(14));
  test('collection is free', () => expect(orderCost(12, 'collection').total).toBe(12));
});

describe('checkout details', () => {
  test('delivery requires city, area and directions', () => {
    const e = validateCheckoutDetails(base);
    expect(Object.keys(e).sort()).toEqual(['area', 'city', 'directions']);
  });
  test('collection does not require delivery details', () => {
    expect(validateCheckoutDetails({ ...base, deliveryMethod: 'collection' })).toEqual({});
  });
  test('contact phone is required', () => {
    expect(validateCheckoutDetails({ ...base, deliveryMethod: 'collection', phone: '+252' }).phone).toBeDefined();
  });
});

describe('admin search', () => {
  const o = { order_number: 'BARWAAQO07', customer_name: 'Amina Ali', customer_phone: '+252612345678', alt_phone: null, payer_phone: null, payment_transaction_ref: 'TX 9981' };
  test('finds by order number', () => expect(orderMatchesSearch(o, 'barwaaqo07')).toBe(true));
  test('finds by phone typed with spaces or leading zero', () => {
    expect(orderMatchesSearch(o, '061 234 5678')).toBe(true);
    expect(orderMatchesSearch(o, '+252 61 234')).toBe(true);
  });
  test('finds by payment reference', () => expect(orderMatchesSearch(o, 'tx9981')).toBe(true));
  test('does not match an unrelated phone', () => expect(orderMatchesSearch(o, '0619999999')).toBe(false));
  test('flags duplicate payment references', () => {
    const a = { id: '1', payment_transaction_ref: 'TX123' };
    const b = { id: '2', payment_transaction_ref: ' tx123 ' };
    const c = { id: '3', payment_transaction_ref: 'TX999' };
    expect(duplicateReferenceOrders(a, [a, b, c]).map(x => x.id)).toEqual(['2']);
  });
});
