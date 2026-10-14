# Architecture
- Render Home and department routes through the shared Index storefront with an optional department key so layout and checkout remain consistent.
- Centralize department category matching in src/lib/departments.ts so navigation, galleries, and listings use the same boundaries.- Create orders only through the create_order_v2 database function (direct inserts are blocked) so totals, delivery fee and order numbers are computed server-side.
- Change order payment/fulfilment statuses only via admin_set_payment_status / admin_set_fulfilment_status; a trigger rejects other changes so every change is admin-checked and logged in order_status_history.
- Order numbers come from a database sequence (never the browser) so they stay unique under concurrency and are never reused.
