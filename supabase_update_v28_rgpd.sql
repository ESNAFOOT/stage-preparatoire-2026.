-- Mise à jour V28 : consentement RGPD
alter table registrations add column if not exists rgpd_consent boolean default false;
