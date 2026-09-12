# Finance – Réductions Frontend V13

Ajouts :
- route `/finance/discounts` et entrée **Réductions** dans Finance & Caisse ;
- demandes individuelles : pourcentage, montant fixe, nouveau montant final ;
- filtre par statut, validation/refus selon permissions ;
- sélection du type de frais ou de tous les frais ;
- règles automatiques avec condition de rang d'enfant dans la famille ;
- portée par cycle, niveau, classe et campus ;
- application/recalcul des règles et affichage des avoirs générés ;
- contrôle de caisse renforcé sur **Nouvel encaissement** : tous les modes sauf `VIREMENT` exigent une session ouverte ;
- lecture de la session ouverte directement depuis le backend lors de l'ouverture de l'écran d'encaissement.

Le backend reste l'autorité pour les permissions, la validation, le recalcul des créances et la création des avoirs.
