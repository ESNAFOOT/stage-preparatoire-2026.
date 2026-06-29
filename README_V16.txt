VERSION V16 - Compteur des places corrigé

Fichier à remplacer sur GitHub :
- app.js

Correction :
- Le planning lit maintenant toutes les inscriptions Supabase.
- Il compte les créneaux même si l'inscription est enregistrée sous formats différents :
  slots, slots_text ou ancien slot.
- Le compteur doit passer de 10/10 à 9/10, 8/10, etc.

Après remplacement :
1. Attends 1 à 2 minutes.
2. Sur le site, fais Cmd + Shift + R pour forcer l'actualisation.
3. Vérifie un créneau déjà utilisé.
