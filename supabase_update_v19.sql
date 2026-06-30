-- Mise à jour V19 : nombre de séances et total dû
alter table registrations add column if not exists number_sessions integer;
alter table registrations add column if not exists amount_due numeric;
