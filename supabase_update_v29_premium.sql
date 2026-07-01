alter table registrations add column if not exists rgpd_consent boolean default false;
alter table registrations add column if not exists number_sessions integer;
alter table registrations add column if not exists amount_due numeric;
