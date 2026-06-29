VERSION V5 - SUPPRESSION DES INSCRITS

Nouveauté :
- Dans admin.html, une colonne Action permet de supprimer une inscription.
- La suppression libère automatiquement les places des créneaux concernés.
- Export Excel / CSV toujours disponible.

Mot de passe admin provisoire :
ESNA2026

À changer dans config.js.

Important :
La suppression en ligne nécessite de relancer le fichier supabase.sql dans Supabase
car il ajoute une policy DELETE.

Pour un site officiel public, il faudra ensuite sécuriser davantage avec Supabase Auth.


VERSION V6 - CORRECTION SUPPRESSION
- Correction du mode démonstration : la ligne disparaît bien après suppression.
- En mode Supabase : si la ligne ne disparaît pas, relancer le fichier supabase.sql dans Supabase pour ajouter l'autorisation DELETE.


VERSION V7 - PLACES RESTANTES
- Chaque créneau affiche maintenant : places restantes / capacité totale.
- Exemple : ✅ 18 places restantes / 20.
- Quand une personne s'inscrit, les places diminuent automatiquement.
- Quand tu supprimes une inscription dans l'admin, les places sont libérées.
- Actualisation automatique du planning toutes les 15 secondes.


VERSION V8
- Capacité maximale modifiée : 10 joueurs par créneau.
- Tous les calculs de places restantes utilisent désormais une capacité de 10.


VERSION V9
- Page personnalisée : INSCRIPTION STAGE PRÉPARATOIRE ESNA 2026.
- Ajout du titre, des dates, catégories, lieu et boutons d'inscription.
- Ajout des balises de partage Facebook/WhatsApp.
