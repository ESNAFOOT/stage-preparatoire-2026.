create table if not exists registrations (
id uuid primary key default gen_random_uuid(),
created_at timestamp with time zone default now(),
player_lastname text,
player_firstname text,
category text,
status text,
package text,
parent_email text,
parent_phone text,
current_club text,
medical_notes text,
slots jsonb,
slots_text text,
payment_method text,
payment_reference text,
payment_status text default 'En attente'
);

alter table registrations enable row level security;

drop policy if exists "insert_public" on registrations;
drop policy if exists "select_public" on registrations;
drop policy if exists "delete_public_temp_admin" on registrations;
drop policy if exists "update_public_temp_admin" on registrations;

create policy "insert_public" on registrations for insert to anon with check (true);
create policy "select_public" on registrations for select to anon using (true);
create policy "delete_public_temp_admin" on registrations for delete to anon using (true);
create policy "update_public_temp_admin" on registrations for update to anon using (true);