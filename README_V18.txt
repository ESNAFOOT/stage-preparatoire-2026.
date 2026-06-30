VERSION V18 - Compteur corrigé définitivement

Fichier à remplacer sur GitHub :
- app.js

Correction :
- Le compteur utilise uniquement la colonne Supabase "slots".
- La colonne "slots_text" n'est plus comptée, elle sert seulement à l'affichage dans l'admin.
- Donc une inscription sur un créneau = 1 place retirée.

Après remplacement :
1. Attendre 1 à 2 minutes.
2. Ouvrir le site.
3. Faire Cmd + Shift + R.
4. Le compteur doit afficher 9 places restantes / 10 pour une seule inscription.
