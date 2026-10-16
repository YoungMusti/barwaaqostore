import { describe, it, expect } from 'bun:test';
import { adjustPrice, buildCustomers, dailySummary } from './insights';

describe('bulk price change', () => {
  it('adds $4 to a price', () => expect(adjustPrice(6, 'add', 4)).toBe(10));
  it('never goes below zero', () => expect(adjustPrice(3, 'add', -5)).toBe(0));
  it('applies a percentage', () => expect(adjustPrice(10, 'percent', 10)).toBe(11));
});

describe('customers', () => {
  it('groups the same phone written differently and skips rejected spend', () => {
    const c = buildCustomers([
      { customer_phone: '+252 61 1234567', total_amount: 10, created_at: '2026-01-01', payment_status: 'paid' },
      { customer_phone: '+252611234567', total_amount: 8, created_at: '2026-01-02', payment_status: 'rejected' },
    ]);
    expect(c.length).toBe(1);
    expect(c[0].orders).toBe(2);
    expect(c[0].spent).toBe(10);
  });
});

describe('daily summary', () => {
  it('counts only today and sums paid', () => {
    const s = dailySummary([
      { customer_phone: '1', total_amount: 10, created_at: '2026-10-16T09:00', payment_status: 'paid' },
      { customer_phone: '2', total_amount: 5, created_at: '2026-10-15T09:00', payment_status: 'verification_pending' },
    ], '2026-10-16');
    expect(s.orders).toBe(1);
    expect(s.paid).toBe(10);
    expect(s.toCheck).toBe(5);
  });
});
