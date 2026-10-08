# Architecture
- Render all department routes through the shared Index storefront with a department key so layout and checkout remain consistent.
- Centralize department category matching in src/lib/departments.ts so navigation, galleries, and listings use the same boundaries.