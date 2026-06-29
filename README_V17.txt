VERSION V17 - Compteur sans doublon

Problème corrigé :
- Chaque inscription enregistrait les créneaux dans deux colonnes : slots et slots_text.
- Le compteur additionnait les deux, donc 1 inscription comptait pour 2 places.
- Maintenant, chaque inscription est comptée une seule fois.

Fichier à remplacer sur GitHub :
- app.js

Après remplacement :
1. Attendre 1 à 2 minutes.
2. Faire Cmd + Shift + R sur le site.
3. Le créneau doit passer à 9 places restantes pour une seule inscription.
