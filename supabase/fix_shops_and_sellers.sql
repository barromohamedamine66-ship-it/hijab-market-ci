-- Script de nettoyage des faux articles démo qui ont été copiés par erreur
-- dans les boutiques des nouvelles vendeuses à cause d'un ancien bug de synchronisation locale.

BEGIN;

-- Suppression des produits qui appartiennent à de vraies boutiques (store_id != demo_stores)
-- mais dont les noms correspondent exactement aux articles de démonstration
DELETE FROM public.products
WHERE store_id NOT IN ('s1000000-0000-0000-0000-000000000001', 's1000000-0000-0000-0000-000000000002')
AND name IN (
    'Hijab Soie de Médine — Vert Émeraude',
    'Abaya Kimono Dubaï Broderie Or',
    'Boubou Bazin Riche Homme',
    'Ensemble Tailleur Modeste 3 Pièces',
    'Pashmina Cachemire Tissé à la Main',
    'Qamis Saoudien Blanc'
);

COMMIT;
