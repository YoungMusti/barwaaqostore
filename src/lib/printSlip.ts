const esc = (s: any) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

/** Opens a printable delivery slip for the rider. */
export function printDeliverySlip(o: Record<string, any>) {
  const w = window.open('', '_blank', 'width=420,height=640');
  if (!w) return;
  const items = (o.order_items || []).map((i: any) =>
    `<tr><td>☐ ${esc(i.product_name)}${i.selected_size ? ` (Size ${esc(i.selected_size)})` : ''}</td><td>x${esc(i.quantity)}</td></tr>`).join('');
  const unpaid = o.payment_status !== 'paid';
  w.document.write(`<html><head><title>${esc(o.order_number)}</title><style>
    body{font-family:system-ui,sans-serif;padding:16px;max-width:380px}h1{font-size:26px;margin:0}
    .b{border:2px dashed #000;padding:10px;margin:10px 0;border-radius:8px}td{padding:3px 0}table{width:100%}
    .k{font-size:11px;text-transform:uppercase;color:#555}.v{font-size:15px;font-weight:600;margin-bottom:6px}
  </style></head><body>
    <div class="k">Barwaaqo Shop — Delivery Slip</div><h1>${esc(o.order_number)}</h1>
    <div class="k">${new Date(o.created_at).toLocaleString()}</div>
    <div class="b"><div class="k">Customer</div><div class="v">${esc(o.customer_name)}</div>
    <div class="k">Phone</div><div class="v">${esc(o.customer_phone)}${o.alt_phone ? ' / ' + esc(o.alt_phone) : ''}</div>
    <div class="k">City / Area</div><div class="v">${esc(o.delivery_city || 'Collection')} ${o.delivery_area ? '— ' + esc(o.delivery_area) : ''}</div>
    <div class="k">How to find</div><div class="v">${esc(o.delivery_directions || '—')}</div>
    ${o.delivery_instructions ? `<div class="k">Instructions</div><div class="v">${esc(o.delivery_instructions)}</div>` : ''}</div>
    <table>${items}</table>
    <div class="b"><div class="k">Total</div><div class="v" style="font-size:22px">$${Number(o.total_amount).toFixed(2)}</div>
    <div class="v">${unpaid ? '⚠ COLLECT PAYMENT / NOT YET PAID' : '✔ PAID'}</div></div>
    <div class="k">Signature: ______________________</div>
    <script>window.onload=()=>window.print()</script></body></html>`);
  w.document.close();
}
