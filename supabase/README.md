# LIVYA Smart App Supabase backend

Standalone backend for the LIVYA Client + Admin web apps.

Project URL: https://ekyvogemusxmgeefrqmc.supabase.co

Apply supabase/schema.sql or supabase/migrations/001_livya_initial.sql to the new project. Enable the Auth providers used by the apps. Create the first staff Auth user and set profiles.role to super_admin. Client Auth users must be linked to metabolic_clients.client_user_id.

Never put a Supabase service-role/secret key in either browser app.
