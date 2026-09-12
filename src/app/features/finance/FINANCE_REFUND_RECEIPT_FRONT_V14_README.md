# Finance frontend V14 — remboursements & reçus

Cette version est basée sur le frontend Finance V13 et est compatible avec le backend Finance V14.

## Changements

- Le reçu distingue maintenant :
  - montant reçu,
  - montant affecté aux créances,
  - avoir créé,
  - avoir restant,
  - montant remboursé,
  - net encaissé.
- Chaque ligne du reçu affiche le montant initialement affecté, le montant contre-passé par remboursement et le net.
- Le détail d'un paiement affiche l'impact de chaque remboursement :
  - montant retiré de l'avoir familial,
  - montant de créances réouvertes.
- Le montant maximum remboursable est calculé côté écran.
- La session de caisse courante est récupérée automatiquement pour les remboursements non-virement.
- Un virement peut être remboursé sans session de caisse, conformément à la règle backend.
- L'impression du reçu reprend les mêmes totaux et explique clairement l'avoir familial.

## Important

Le backend reste autoritaire. Le frontend ne modifie jamais lui-même les créances ni les avoirs : il affiche le résultat renvoyé par V14.

Pour les remboursements historiques créés avant V14, utiliser une seule fois l'endpoint backend `POST /api/finance/refunds/reconcile-legacy`, puis recharger les écrans.
