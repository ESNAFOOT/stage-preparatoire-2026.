VERSION V22 - Montant sélection corrigé

À remplacer sur GitHub :
- app.js

Correction :
- Le montant à payer se met à jour dès qu'un créneau est coché ou décoché.
- Le total est calculé avec selected.length, donc avec les vrais créneaux sélectionnés.
- Le montant se recalcule aussi si le parent change Licencié ESNA / Non licencié ESNA.

Après remplacement :
1. Attendre 1 à 2 minutes.
2. Faire Cmd + Shift + R sur le site.
3. Tester : 5 créneaux licencié ESNA = 100 €.
