# Extension Finance Frontend V1

Cette version part du frontend Angular fourni le 11/09/2026 et conserve les écrans existants.

## Ajouts principaux

- Dashboard Finance connecté à `/api/finance/tracking/dashboard`.
- Situation financière consolidée par famille avec détail par élève.
- Écran Impayés & retards.
- Génération des mensualités/échéanciers depuis une scolarisation.
- Avoirs familles réellement utilisables sur une créance.
- Reçu de paiement consultable et imprimable depuis le détail d'un paiement.
- Caisse : récupération serveur de la session ouverte, historique des sessions et conservation des mouvements.
- Correction de la permission du menu Avoirs familles : `PAIEMENT_CONSULTER`.
- Correction de la fréquence tarifaire annuelle : `ANNUAL` au lieu de `YEARLY`.
- Suppression de la route dupliquée `fee-types`.

## Nouvelles routes

- `/finance/situations`
- `/finance/overdue`
- `/finance/installments`

## Nouveaux services

- `FinanceTrackingService`
- `PaymentReceiptService`

## Nouveaux modèles

- `finance-tracking.model.ts`

## Ordre de test conseillé

1. Ouvrir `/finance` et vérifier le dashboard pour l'année courante.
2. Ouvrir `/finance/installments`, choisir une scolarisation et générer l'échéancier.
3. Ouvrir `/finance/situations`, choisir un responsable et vérifier les montants famille/élèves.
4. Ouvrir `/finance/overdue` et vérifier les créances échues.
5. Ouvrir un paiement puis cliquer sur `Reçu`.
6. Ouvrir `/finance/cash`, vérifier que la session ouverte est retrouvée après rechargement et que l'historique apparaît.
7. Ouvrir `/finance/credits`, sélectionner un responsable, puis utiliser un avoir sur une créance encore due.

## Remarque

Aucune migration Flyway n'est incluse dans ce frontend. Il est prévu pour le backend Finance V11 validé juste avant.
