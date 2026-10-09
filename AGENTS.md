# Architecture
- Render Home and department routes through the shared Index storefront with an optional department key so layout and checkout remain consistent.
- Centralize department category matching in src/lib/departments.ts so navigation, galleries, and listings use the same boundaries.