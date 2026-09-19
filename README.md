# LIVYA Smart App

Two linked web applications:

- `client/` → patient/client application
- `admin/` → clinician/admin dashboard
- `supabase/` → database schema and RLS

Production domains:
- https://app.livyacurehub.com
- https://admin.livyacurehub.com

## Local setup

1. Copy `.env.example` to `.env` in each app, or set the variables in Vercel.
2. Set the Supabase publishable key.
3. Apply `supabase/schema.sql` in the new Supabase project's SQL editor.
4. `npm install`
5. `npm run dev:client` or `npm run dev:admin`

The browser apps use only the Supabase publishable/anon key. Never put a service-role key in the frontend.
