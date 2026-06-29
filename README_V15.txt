VERSION V15 - Correction places restantes

Problème corrigé :
- Le site demandait à Supabase une colonne "slot" qui n'existe pas.
- Supabase renvoyait une erreur.
- Résultat : les inscriptions apparaissaient dans l'admin, mais les places restantes ne bougeaient pas.

Fichier à remplacer sur GitHub :
- app.js

Après remplacement :
1. Attendre 1 à 2 minutes.
2. Ouvrir le site.
3. Faire Cmd + R.
4. Les places restantes doivent maintenant diminuer.
