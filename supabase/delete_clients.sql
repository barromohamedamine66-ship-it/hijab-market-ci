-- Script pour supprimer définitivement tous les comptes clients (rôle 'customer')

BEGIN;

-- Supprimer les utilisateurs de auth.users (cela supprimera en cascade dans public.profiles)
DELETE FROM auth.users
WHERE id IN (
  SELECT id FROM public.profiles WHERE role = 'customer'
);

COMMIT;
